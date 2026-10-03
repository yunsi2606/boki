package com.boki.application.service;

import com.boki.application.dto.request.FlashSaleItemRequest;
import com.boki.application.dto.request.FlashSaleRequest;
import com.boki.application.dto.response.FlashSaleResponse;
import com.boki.application.dto.response.PublicFlashSaleResponse;
import com.boki.domain.model.book.Book;
import com.boki.domain.model.book.BookId;
import com.boki.domain.model.flashsale.FlashSaleStatus;
import com.boki.domain.port.out.BookRepository;
import com.boki.infrastructure.persistence.entity.FlashSaleItemJpaEntity;
import com.boki.infrastructure.persistence.entity.FlashSaleJpaEntity;
import com.boki.infrastructure.persistence.repository.FlashSaleItemJpaRepository;
import com.boki.infrastructure.persistence.repository.FlashSaleJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class FlashSaleApplicationService {

    private final FlashSaleJpaRepository flashSaleRepository;
    private final FlashSaleItemJpaRepository flashSaleItemRepository;
    private final BookRepository bookRepository;
    private final FlashSaleMapper mapper;

    public FlashSaleApplicationService(
            FlashSaleJpaRepository flashSaleRepository,
            FlashSaleItemJpaRepository flashSaleItemRepository,
            BookRepository bookRepository,
            FlashSaleMapper mapper
    ) {
        this.flashSaleRepository = flashSaleRepository;
        this.flashSaleItemRepository = flashSaleItemRepository;
        this.bookRepository = bookRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<FlashSaleResponse> getAllFlashSales() {
        return flashSaleRepository.findAllByOrderByStartTimeDesc().stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<PublicFlashSaleResponse> getActiveFlashSale() {
        return getActivePublicFlashSale();
    }

    @Transactional(readOnly = true)
    public Optional<PublicFlashSaleResponse> getActivePublicFlashSale() {
        OffsetDateTime now = OffsetDateTime.now();
        return flashSaleRepository.findFirstActiveSale(now)
                .map(sale -> mapper.toPublicResponse(sale, now));
    }

    @Transactional(readOnly = true)
    public List<PublicFlashSaleResponse> getUpcomingOrActiveSales() {
        OffsetDateTime now = OffsetDateTime.now();
        return flashSaleRepository.findAllByOrderByStartTimeDesc().stream()
                .filter(s -> s.getStatus() != FlashSaleStatus.CANCELLED && s.getStatus() != FlashSaleStatus.ENDED)
                .map(s -> mapper.toPublicResponse(s, now))
                .toList();
    }

    @Transactional(readOnly = true)
    public FlashSaleResponse getFlashSaleById(UUID id) {
        FlashSaleJpaEntity sale = flashSaleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chiến dịch Flash Sale với ID: " + id));
        return mapper.toResponse(sale);
    }

    @Transactional
    public FlashSaleResponse createFlashSale(FlashSaleRequest request) {
        validateRequest(request);

        OffsetDateTime now = OffsetDateTime.now();
        FlashSaleJpaEntity sale = new FlashSaleJpaEntity();
        sale.setName(request.name().trim());
        sale.setDescription(request.description());
        sale.setBannerUrl(request.bannerUrl());
        sale.setStartTime(request.startTime());
        sale.setEndTime(request.endTime());
        sale.setStatus(determineInitialStatus(request.startTime(), request.endTime(), now));
        sale.setCreatedAt(now);
        sale.setUpdatedAt(now);

        FlashSaleJpaEntity savedSale = flashSaleRepository.save(sale);

        if (request.items() != null) {
            for (int i = 0; i < request.items().size(); i++) {
                saveItem(savedSale, request.items().get(i), i);
            }
        }

        return getFlashSaleById(savedSale.getId());
    }

    @Transactional
    public FlashSaleResponse updateFlashSale(UUID id, FlashSaleRequest request) {
        validateRequest(request);

        FlashSaleJpaEntity sale = flashSaleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chiến dịch Flash Sale với ID: " + id));

        sale.setName(request.name().trim());
        sale.setDescription(request.description());
        sale.setBannerUrl(request.bannerUrl());
        sale.setStartTime(request.startTime());
        sale.setEndTime(request.endTime());
        sale.setUpdatedAt(OffsetDateTime.now());

        flashSaleItemRepository.deleteByFlashSaleId(id);

        if (request.items() != null) {
            for (int i = 0; i < request.items().size(); i++) {
                saveItem(sale, request.items().get(i), i);
            }
        }

        FlashSaleJpaEntity updated = flashSaleRepository.save(sale);
        return getFlashSaleById(updated.getId());
    }

    @Transactional
    public FlashSaleResponse updateStatus(UUID id, FlashSaleStatus status) {
        FlashSaleJpaEntity sale = flashSaleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chiến dịch Flash Sale với ID: " + id));

        sale.setStatus(status);
        sale.setUpdatedAt(OffsetDateTime.now());
        FlashSaleJpaEntity saved = flashSaleRepository.save(sale);
        return mapper.toResponse(saved);
    }

    @Transactional
    public void deleteFlashSale(UUID id) {
        if (!flashSaleRepository.existsById(id)) {
            throw new IllegalArgumentException("Không tìm thấy chiến dịch Flash Sale với ID: " + id);
        }
        flashSaleRepository.deleteById(id);
    }

    private void saveItem(FlashSaleJpaEntity sale, FlashSaleItemRequest itemReq, int displayOrder) {
        Book book = bookRepository.findById(BookId.of(itemReq.bookId()))
                .orElseThrow(() -> new IllegalArgumentException("Sách không tồn tại: " + itemReq.bookId()));

        BigDecimal origPrice = itemReq.originalPrice() != null ? itemReq.originalPrice() : book.getPrice().amount();
        BigDecimal flashPrice = itemReq.flashSalePrice();

        int discountPercent = 0;
        if (origPrice.compareTo(BigDecimal.ZERO) > 0 && flashPrice.compareTo(origPrice) < 0) {
            discountPercent = origPrice.subtract(flashPrice)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(origPrice, 0, java.math.RoundingMode.HALF_UP)
                    .intValue();
        }

        FlashSaleItemJpaEntity item = new FlashSaleItemJpaEntity();
        item.setFlashSale(sale);
        item.setBookId(book.getId().value());
        item.setOriginalPrice(origPrice);
        item.setFlashSalePrice(flashPrice);
        item.setDiscountPercent(discountPercent);
        item.setQuantityLimit(itemReq.quantityLimit());
        item.setSoldQuantity(0);
        item.setUserLimit(itemReq.userLimit() > 0 ? itemReq.userLimit() : 1);
        item.setCreatedAt(OffsetDateTime.now());

        flashSaleItemRepository.save(item);
    }

    private void validateRequest(FlashSaleRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("Tên chiến dịch Flash Sale không được để trống");
        }
        if (request.startTime() == null || request.endTime() == null) {
            throw new IllegalArgumentException("Thời gian bắt đầu và kết thúc không được để trống");
        }
        if (!request.endTime().isAfter(request.startTime())) {
            throw new IllegalArgumentException("Thời gian kết thúc phải diễn ra sau thời gian bắt đầu");
        }
        if (request.items() == null || request.items().isEmpty()) {
            throw new IllegalArgumentException("Chiến dịch Flash Sale phải có ít nhất 1 sản phẩm");
        }
    }

    private FlashSaleStatus determineInitialStatus(OffsetDateTime start, OffsetDateTime end, OffsetDateTime now) {
        if (now.isBefore(start)) return FlashSaleStatus.SCHEDULED;
        if (now.isAfter(end)) return FlashSaleStatus.ENDED;
        return FlashSaleStatus.ACTIVE;
    }
}
