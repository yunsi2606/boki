package com.boki.application.service;

import com.boki.application.dto.excel.*;
import com.boki.application.exception.ResourceNotFoundException;
import com.boki.domain.model.user.Email;
import com.boki.domain.model.user.User;
import com.boki.domain.port.out.UserRepository;
import com.boki.infrastructure.persistence.entity.BookJpaEntity;
import com.boki.infrastructure.persistence.entity.BookVariantJpaEntity;
import com.boki.infrastructure.persistence.entity.CategoryJpaEntity;
import com.boki.infrastructure.persistence.repository.BookJpaRepository;
import com.boki.infrastructure.persistence.repository.BookVariantJpaRepository;
import com.boki.infrastructure.persistence.repository.CategoryJpaRepository;
import com.boki.infrastructure.storage.CloudflareR2StorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Service
public class AdminBookExcelApplicationService {

    private final BookExcelParser parser;
    private final BookCoverResolverService coverResolver;
    private final CloudflareR2StorageService storageService;
    private final BookJpaRepository bookRepository;
    private final BookVariantJpaRepository variantRepository;
    private final CategoryJpaRepository categoryRepository;
    private final UserRepository userRepository;

    public AdminBookExcelApplicationService(
            BookExcelParser parser, BookCoverResolverService coverResolver,
            CloudflareR2StorageService storageService, BookJpaRepository bookRepository,
            BookVariantJpaRepository variantRepository, CategoryJpaRepository categoryRepository,
            UserRepository userRepository
    ) {
        this.parser = parser;
        this.coverResolver = coverResolver;
        this.storageService = storageService;
        this.bookRepository = bookRepository;
        this.variantRepository = variantRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public BookExcelImportResultResponse processImport(
            InputStream excelStream, List<MultipartFile> imageFiles, boolean dryRun, String sellerEmail
    ) throws Exception {
        User seller = userRepository.findByEmail(Email.of(sellerEmail))
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", sellerEmail));

        List<BookExcelRowError> errors = new ArrayList<>();
        List<BookExcelGroupedBook> books = parser.parseWorkbook(excelStream, errors);

        // Map uploaded image files by filename
        Map<String, MultipartFile> fileMap = new HashMap<>();
        if (imageFiles != null) {
            for (MultipartFile f : imageFiles) {
                if (f != null && !f.isEmpty() && f.getOriginalFilename() != null) {
                    fileMap.put(f.getOriginalFilename().trim().toLowerCase(), f);
                }
            }
        }

        // Cache categories in-memory to prevent N+1 query
        Map<String, Integer> catMap = new HashMap<>();
        for (CategoryJpaEntity c : categoryRepository.findAll()) {
            catMap.put(c.getName().trim().toLowerCase(), c.getId());
            catMap.put(String.valueOf(c.getId()), c.getId());
        }

        int validBooks = 0;
        for (BookExcelGroupedBook b : books) {
            resolveImages(b, fileMap);
            if (b.getValidationErrors().isEmpty()) {
                validBooks++;
                if (!dryRun) {
                    persistBookWithVariants(b, seller.getId().value(), catMap);
                }
            }
        }

        return new BookExcelImportResultResponse(
                books.size(), books.size(), validBooks, errors.size(), errors, books, dryRun
        );
    }

    private void resolveImages(BookExcelGroupedBook b, Map<String, MultipartFile> fileMap) {
        // Resolve book cover
        b.setResolvedCoverUrl(resolveSingleImage(b.getCoverImageRef(), b.getIsbn(), b.getTitle(), fileMap));

        // Resolve variants images
        List<BookExcelVariantData> resolvedVariants = new ArrayList<>();
        for (BookExcelVariantData v : b.getVariants()) {
            String vUrl = resolveSingleImage(v.imageRef(), null, null, fileMap);
            if (vUrl == null) vUrl = b.getResolvedCoverUrl();
            resolvedVariants.add(v.withResolvedImage(vUrl));
        }
        b.setVariants(resolvedVariants);
    }

    private String resolveSingleImage(String ref, String isbn, String title, Map<String, MultipartFile> fileMap) {
        if (ref != null && !ref.isBlank()) {
            String key = ref.trim().toLowerCase();
            if (fileMap.containsKey(key)) {
                try {
                    return storageService.uploadFile(fileMap.get(key));
                } catch (Exception ignored) {}
            }
            if (ref.startsWith("http://") || ref.startsWith("https://")) {
                return storageService.uploadFromUrl(ref);
            }
        }
        if ((ref == null || ref.isBlank()) && (isbn != null || title != null)) {
            return coverResolver.resolveAndUploadCover(isbn, title);
        }
        return null;
    }

    private Set<Integer> resolveCategoryIds(BookExcelGroupedBook b, Map<String, Integer> catMap) {
        Set<Integer> catIds = new LinkedHashSet<>();
        for (String cName : b.getCategoryNames()) {
            Integer id = catMap.get(cName.trim().toLowerCase());
            if (id != null) catIds.add(id);
        }
        if (catIds.isEmpty() && !catMap.isEmpty()) {
            catIds.add(catMap.values().iterator().next());
        }
        return catIds;
    }

    private void persistBookWithVariants(BookExcelGroupedBook b, UUID sellerId, Map<String, Integer> catMap) {
        BookJpaEntity book = new BookJpaEntity();
        book.setSellerId(sellerId);
        book.setTitle(b.getTitle());
        book.setAuthor(b.getAuthor());
        book.setIsbn(b.getIsbn());
        book.setDescription(b.getDescription());
        String baseSlug = com.boki.infrastructure.util.SlugUtils.slugify(b.getTitle());
        book.setSlug(baseSlug + "-" + UUID.randomUUID().toString().substring(0, 8));
        book.setCategoryCoverUrl(b.getResolvedCoverUrl());
        book.setCondition(parseCondition(b.getCondition()));
        book.setStatus(BookJpaEntity.BookStatusJpa.ACTIVE);
        book.setCreatedAt(Instant.now());
        book.setUpdatedAt(Instant.now());
        book.setCreatedBy(sellerId.toString());
        book.setPreOrder(b.isPreOrder());
        book.setPreOrderDays(b.getPreOrderDays());
        book.setMaxOrderQuantity(b.getMaxOrderQuantity());

        Set<Integer> cIds = resolveCategoryIds(b, catMap);
        if (!cIds.isEmpty()) {
            book.setCategoryId(cIds.iterator().next());
            book.setCategoryIds(cIds);
        }

        // Publication details map
        Map<String, String> details = new LinkedHashMap<>();
        if (b.getPublisher() != null) details.put("Nhà xuất bản", b.getPublisher());
        if (b.getSupplier() != null) details.put("Công ty phát hành", b.getSupplier());
        if (b.getPublicationYear() != null) details.put("Năm xuất bản", b.getPublicationYear());
        if (b.getCoverType() != null) details.put("Hình thức bìa", b.getCoverType());
        if (b.getPageCount() != null) details.put("Số trang", String.valueOf(b.getPageCount()));
        book.setPublicationDetails(details);

        // Price & Stock
        if (!b.getVariants().isEmpty()) {
            int totalStock = b.getVariants().stream().mapToInt(BookExcelVariantData::stockQuantity).sum();
            book.setStockQuantity(totalStock);
            BigDecimal minP = b.getVariants().stream().map(BookExcelVariantData::price).filter(Objects::nonNull).min(BigDecimal::compareTo).orElse(b.getPrice());
            book.setPrice(minP != null ? minP : BigDecimal.ZERO);
        } else {
            book.setStockQuantity(b.getStockQuantity());
            book.setPrice(b.getPrice() != null ? b.getPrice() : BigDecimal.ZERO);
        }
        if (b.getOriginalPrice() != null) book.setOriginalPrice(b.getOriginalPrice());

        BookJpaEntity savedBook = bookRepository.save(book);

        // Save variants if present
        if (!b.getVariants().isEmpty()) {
            List<BookVariantJpaEntity> variantEntities = new ArrayList<>();
            for (BookExcelVariantData v : b.getVariants()) {
                BookVariantJpaEntity ve = new BookVariantJpaEntity();
                ve.setBook(savedBook);
                ve.setName(v.name());
                ve.setSku(v.sku());
                ve.setPrice(v.price() != null ? v.price() : savedBook.getPrice());
                ve.setOriginalPrice(v.originalPrice());
                ve.setStockQuantity(v.stockQuantity());
                ve.setImageUrl(v.resolvedImageUrl());
                variantEntities.add(ve);
            }
            variantRepository.saveAll(variantEntities);
        }
    }

    private BookJpaEntity.BookConditionJpa parseCondition(String cond) {
        if (cond == null) return BookJpaEntity.BookConditionJpa.GOOD;
        String s = cond.trim().toUpperCase();
        if (s.contains("MỚI") || s.contains("NEW")) return BookJpaEntity.BookConditionJpa.NEW;
        if (s.contains("NHƯ") || s.contains("LIKE")) return BookJpaEntity.BookConditionJpa.LIKE_NEW;
        if (s.contains("TỐT") || s.contains("GOOD")) return BookJpaEntity.BookConditionJpa.GOOD;
        if (s.contains("KHÁ") || s.contains("FAIR")) return BookJpaEntity.BookConditionJpa.FAIR;
        if (s.contains("CŨ") || s.contains("POOR")) return BookJpaEntity.BookConditionJpa.POOR;
        return BookJpaEntity.BookConditionJpa.GOOD;
    }
}
