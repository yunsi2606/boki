package com.boki.application.service;

import com.boki.application.dto.request.TrackRecommendationEventRequest;
import com.boki.application.dto.response.*;
import com.boki.application.exception.ResourceNotFoundException;
import com.boki.application.mapper.BookDtoMapper;
import com.boki.application.port.in.GetRecommendationsUseCase;
import com.boki.application.port.in.ManageRecommendationUseCase;
import com.boki.domain.model.book.Book;
import com.boki.domain.model.user.Email;
import com.boki.domain.model.user.User;
import com.boki.domain.port.out.UserRepository;
import com.boki.infrastructure.persistence.entity.*;
import com.boki.infrastructure.persistence.mapper.BookPersistenceMapper;
import com.boki.infrastructure.persistence.repository.*;
import com.boki.infrastructure.scheduler.RecommendationRecomputeScheduler;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationApplicationService implements GetRecommendationsUseCase, ManageRecommendationUseCase {

    private final BookJpaRepository bookRepository;
    private final BookSimilarityJpaRepository similarityRepository;
    private final BookCoOccurrenceJpaRepository coOccurrenceRepository;
    private final RecommendationLogJpaRepository logRepository;
    private final UserRepository userRepository;
    private final UserAffinityProfileService affinityService;
    private final RecommendationRecomputeScheduler scheduler;
    private final BookDtoMapper bookDtoMapper;

    public RecommendationApplicationService(
            BookJpaRepository bookRepository,
            BookSimilarityJpaRepository similarityRepository,
            BookCoOccurrenceJpaRepository coOccurrenceRepository,
            RecommendationLogJpaRepository logRepository,
            UserRepository userRepository,
            UserAffinityProfileService affinityService,
            RecommendationRecomputeScheduler scheduler,
            BookDtoMapper bookDtoMapper
    ) {
        this.bookRepository = bookRepository;
        this.similarityRepository = similarityRepository;
        this.coOccurrenceRepository = coOccurrenceRepository;
        this.logRepository = logRepository;
        this.userRepository = userRepository;
        this.affinityService = affinityService;
        this.scheduler = scheduler;
        this.bookDtoMapper = bookDtoMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecommendationBookResponse> getPersonalized(String userEmail, String sessionId, int limit) {
        UUID userId = null;
        if (userEmail != null && !userEmail.isBlank()) {
            userId = userRepository.findByEmail(Email.of(userEmail)).map(User::getId).map(id -> id.value()).orElse(null);
        }

        UserAffinityProfileService.UserAffinity affinity = affinityService.getUserAffinity(userId, sessionId);
        if (affinity.isEmpty()) {
            return getTrending(7, limit);
        }

        List<BookJpaEntity> activeBooks = bookRepository.findByStatus(BookJpaEntity.BookStatusJpa.ACTIVE, PageRequest.of(0, 100)).getContent();
        List<RecommendationBookResponse> list = new ArrayList<>();

        for (BookJpaEntity b : activeBooks) {
            if (affinity.recentBookIds().contains(b.getId())) continue;

            double score = 0.0;
            String reason = "Dựa trên sách bạn quan tâm";
            if (b.getCategoryId() != null && affinity.categoryScores().containsKey(b.getCategoryId())) {
                score += affinity.categoryScores().get(b.getCategoryId()) * 1.5;
                reason = "Thể loại bạn yêu thích";
            }
            if (b.getAuthor() != null && affinity.authorScores().containsKey(b.getAuthor().trim().toLowerCase())) {
                score += affinity.authorScores().get(b.getAuthor().trim().toLowerCase()) * 2.0;
                reason = "Cùng tác giả " + b.getAuthor().trim();
            }

            if (score > 0) {
                list.add(new RecommendationBookResponse(toBookResponse(b), BigDecimal.valueOf(score).setScale(2, RoundingMode.HALF_UP), "AFFINITY", reason, "PERSONALIZED"));
            }
        }

        list.sort((a, b) -> b.matchScore().compareTo(a.matchScore()));
        return list.stream().limit(limit).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecommendationBookResponse> getSimilarBooks(String idOrSlug, int limit) {
        BookJpaEntity source = findBook(idOrSlug);
        List<BookSimilarityJpaEntity> sims = similarityRepository.findBySourceBookId(source.getId(), PageRequest.of(0, limit));

        if (!sims.isEmpty()) {
            return sims.stream()
                    .map(s -> new RecommendationBookResponse(toBookResponse(s.getTargetBook()), s.getSimilarityScore(), s.getReasonCode(), s.getReasonLabel(), "SIMILAR"))
                    .collect(Collectors.toList());
        }

        // On-the-fly fallback
        List<BookJpaEntity> fallback = source.getCategoryId() != null
                ? bookRepository.findByStatusAndCategoryId(BookJpaEntity.BookStatusJpa.ACTIVE, source.getCategoryId(), PageRequest.of(0, limit + 1)).getContent()
                : Collections.emptyList();

        return fallback.stream()
                .filter(b -> !b.getId().equals(source.getId()))
                .limit(limit)
                .map(b -> new RecommendationBookResponse(toBookResponse(b), BigDecimal.valueOf(0.75), "SAME_CATEGORY", "Cùng thể loại", "SIMILAR"))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FrequentlyBoughtTogetherResponse getFrequentlyBoughtTogether(String idOrSlug) {
        BookJpaEntity mainBook = findBook(idOrSlug);
        List<BookCoOccurrenceJpaEntity> coList = coOccurrenceRepository.findByBookAId(mainBook.getId(), PageRequest.of(0, 2));
        List<BookJpaEntity> items = new ArrayList<>();

        for (BookCoOccurrenceJpaEntity co : coList) {
            items.add(co.getBookB());
        }

        if (items.isEmpty() && mainBook.getCategoryId() != null) {
            List<BookJpaEntity> cats = bookRepository.findByStatusAndCategoryId(BookJpaEntity.BookStatusJpa.ACTIVE, mainBook.getCategoryId(), PageRequest.of(0, 3)).getContent();
            for (BookJpaEntity b : cats) {
                if (!b.getId().equals(mainBook.getId()) && items.size() < 2) items.add(b);
            }
        }

        BookResponse mainResp = toBookResponse(mainBook);
        List<BookResponse> itemResps = items.stream().map(this::toBookResponse).collect(Collectors.toList());

        BigDecimal totalRetail = mainBook.getPrice();
        for (BookJpaEntity it : items) {
            if (it.getPrice() != null) totalRetail = totalRetail.add(it.getPrice());
        }

        // 6% discount for purchasing full bundle together
        BigDecimal bundlePrice = totalRetail.multiply(BigDecimal.valueOf(0.94)).setScale(0, RoundingMode.HALF_UP);
        BigDecimal savingsAmount = totalRetail.subtract(bundlePrice);

        return new FrequentlyBoughtTogetherResponse(mainResp, itemResps, totalRetail, bundlePrice, savingsAmount, 6);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecommendationBookResponse> getCartAddons(List<UUID> bookIds, BigDecimal cartTotal, int limit) {
        if (bookIds == null || bookIds.isEmpty()) return getTrending(7, limit);

        List<BookCoOccurrenceJpaEntity> coList = coOccurrenceRepository.findByBookAIdInAndBookBIdNotIn(bookIds, PageRequest.of(0, limit));
        Set<UUID> chosen = new HashSet<>();
        List<RecommendationBookResponse> res = new ArrayList<>();

        for (BookCoOccurrenceJpaEntity co : coList) {
            if (chosen.add(co.getBookB().getId())) {
                res.add(new RecommendationBookResponse(toBookResponse(co.getBookB()), co.getConfidenceScore(), "FREQUENTLY_BOUGHT", "Thường được mua cùng giỏ hàng", "CART_ADDON"));
            }
        }

        if (res.size() < limit) {
            List<RecommendationBookResponse> trending = getTrending(7, limit - res.size());
            for (RecommendationBookResponse tr : trending) {
                if (!bookIds.contains(tr.book().id()) && chosen.add(tr.book().id())) {
                    res.add(tr);
                }
            }
        }
        return res;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecommendationBookResponse> getTrending(int days, int limit) {
        List<BookJpaEntity> top = bookRepository.findByStatus(BookJpaEntity.BookStatusJpa.ACTIVE, PageRequest.of(0, limit)).getContent();
        return top.stream()
                .map(b -> new RecommendationBookResponse(toBookResponse(b), BigDecimal.valueOf(0.90), "TRENDING", "Thịnh hành tuần này", "TRENDING"))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void trackInteraction(TrackRecommendationEventRequest req, String userEmail) {
        UUID userId = null;
        if (userEmail != null && !userEmail.isBlank()) {
            userId = userRepository.findByEmail(Email.of(userEmail)).map(u -> u.getId().value()).orElse(null);
        }

        if ("IMPRESSION".equalsIgnoreCase(req.eventAction())) {
            BookJpaEntity book = bookRepository.findById(req.bookId()).orElse(null);
            if (book != null) {
                logRepository.save(new RecommendationLogJpaEntity(userId, req.sessionId(), req.widgetType(), book, req.positionIndex() != null ? req.positionIndex() : 0));
            }
        } else {
            logRepository.findTopBySessionIdAndBookIdOrderByCreatedAtDesc(req.sessionId(), req.bookId()).ifPresent(log -> {
                if ("CLICK".equalsIgnoreCase(req.eventAction())) log.setClicked(true);
                else if ("ADD_TO_CART".equalsIgnoreCase(req.eventAction())) log.setConvertedToCart(true);
                else if ("ORDER".equalsIgnoreCase(req.eventAction())) log.setConvertedToOrder(true);
                logRepository.save(log);
            });
        }
    }

    @Override
    @Transactional(readOnly = true)
    public RecommendationMetricsResponse getMetrics(int days) {
        Instant since = Instant.now().minus(Math.max(days, 1), ChronoUnit.DAYS);
        List<Object[]> raw = logRepository.getMetricsGroupedByWidget(since);

        long totalImp = 0, totalClicks = 0, totalCart = 0, totalOrder = 0;
        List<RecommendationMetricsResponse.WidgetMetricItem> items = new ArrayList<>();

        for (Object[] r : raw) {
            String widget = (String) r[0];
            long imp = ((Number) r[1]).longValue();
            long clk = ((Number) r[2]).longValue();
            long cart = ((Number) r[3]).longValue();
            long ord = ((Number) r[4]).longValue();

            totalImp += imp;
            totalClicks += clk;
            totalCart += cart;
            totalOrder += ord;

            double ctr = imp > 0 ? (double) clk / (double) imp * 100.0 : 0.0;
            double cr = clk > 0 ? (double) ord / (double) clk * 100.0 : 0.0;
            items.add(new RecommendationMetricsResponse.WidgetMetricItem(widget, imp, clk, Math.round(ctr * 10.0) / 10.0, cart, ord, Math.round(cr * 10.0) / 10.0));
        }

        double overallCtr = totalImp > 0 ? (double) totalClicks / (double) totalImp * 100.0 : 0.0;
        double overallCr = totalClicks > 0 ? (double) totalOrder / (double) totalClicks * 100.0 : 0.0;

        return new RecommendationMetricsResponse(totalImp, totalClicks, Math.round(overallCtr * 10.0) / 10.0, totalCart, totalOrder, Math.round(overallCr * 10.0) / 10.0, items);
    }

    @Override
    public void recomputeAllModels() {
        scheduler.recomputeAll();
    }

    private BookJpaEntity findBook(String idOrSlug) {
        try {
            return bookRepository.findById(UUID.fromString(idOrSlug))
                    .orElseThrow(() -> new ResourceNotFoundException("Book", "id", idOrSlug));
        } catch (IllegalArgumentException e) {
            return bookRepository.findBySlug(idOrSlug)
                    .orElseThrow(() -> new ResourceNotFoundException("Book", "slug", idOrSlug));
        }
    }

    private BookResponse toBookResponse(BookJpaEntity entity) {
        Book domain = BookPersistenceMapper.toDomainModel(entity);
        return bookDtoMapper.toResponse(domain);
    }
}
