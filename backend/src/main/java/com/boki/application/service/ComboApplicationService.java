package com.boki.application.service;

import com.boki.application.dto.request.ComboItemInput;
import com.boki.application.dto.request.CreateComboRequest;
import com.boki.application.dto.request.UpdateComboRequest;
import com.boki.application.dto.response.BookResponse;
import com.boki.application.exception.BusinessRuleException;
import com.boki.application.exception.ResourceNotFoundException;
import com.boki.application.mapper.BookDtoMapper;
import com.boki.application.port.in.GetComboUseCase;
import com.boki.application.port.in.ManageComboUseCase;
import com.boki.domain.model.book.Book;
import com.boki.domain.model.user.Email;
import com.boki.domain.model.user.User;
import com.boki.domain.port.out.UserRepository;
import com.boki.infrastructure.persistence.entity.BookComboItemJpaEntity;
import com.boki.infrastructure.persistence.entity.BookImageJpaEntity;
import com.boki.infrastructure.persistence.entity.BookJpaEntity;
import com.boki.infrastructure.persistence.entity.BookVariantJpaEntity;
import com.boki.infrastructure.persistence.mapper.BookPersistenceMapper;
import com.boki.infrastructure.persistence.repository.BookComboItemJpaRepository;
import com.boki.infrastructure.persistence.repository.BookJpaRepository;
import com.boki.infrastructure.persistence.repository.BookVariantJpaRepository;
import com.boki.infrastructure.util.SlugUtils;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ComboApplicationService implements ManageComboUseCase, GetComboUseCase {

    private final BookJpaRepository bookJpaRepository;
    private final BookComboItemJpaRepository comboItemRepository;
    private final BookVariantJpaRepository variantRepository;
    private final UserRepository userRepository;
    private final BookDtoMapper bookDtoMapper;

    public ComboApplicationService(
            BookJpaRepository bookJpaRepository,
            BookComboItemJpaRepository comboItemRepository,
            BookVariantJpaRepository variantRepository,
            UserRepository userRepository,
            BookDtoMapper bookDtoMapper
    ) {
        this.bookJpaRepository = bookJpaRepository;
        this.comboItemRepository = comboItemRepository;
        this.variantRepository = variantRepository;
        this.userRepository = userRepository;
        this.bookDtoMapper = bookDtoMapper;
    }

    @Override
    @Transactional
    public BookResponse createCombo(CreateComboRequest request, String sellerEmail) {
        User seller = getSeller(sellerEmail);
        BookJpaEntity combo = new BookJpaEntity();
        combo.setSellerId(seller.getId().value());
        combo.setTitle(request.title().trim());
        combo.setSlug(SlugUtils.slugify(request.title()));
        combo.setDescription(request.description());
        if (request.categoryIds() != null && !request.categoryIds().isEmpty()) {
            combo.setCategoryIds(new java.util.LinkedHashSet<>(request.categoryIds()));
        } else if (request.categoryId() != null) {
            combo.setCategoryId(request.categoryId());
        }
        combo.setPrice(request.price());
        combo.setCurrency("VND");
        combo.setCondition(BookJpaEntity.BookConditionJpa.NEW);
        combo.setStatus(BookJpaEntity.BookStatusJpa.ACTIVE);
        combo.setCombo(true);
        combo.setCreatedAt(Instant.now());
        combo.setUpdatedAt(Instant.now());
        combo.setCreatedBy(seller.getId().toString());

        setupComboItemsAndDetails(combo, request.items(), request.stockQuantity(), request.imageUrls());
        BookJpaEntity saved = bookJpaRepository.save(combo);
        saveComboItems(saved, request.items());

        return toResponse(saved);
    }

    @Override
    @Transactional
    public BookResponse updateCombo(UUID comboId, UpdateComboRequest request, String sellerEmail) {
        User seller = getSeller(sellerEmail);
        BookJpaEntity combo = bookJpaRepository.findById(comboId)
                .orElseThrow(() -> new ResourceNotFoundException("Combo", "id", comboId));

        if (!combo.getSellerId().equals(seller.getId().value()) && seller.getRole() != com.boki.domain.model.user.UserRole.ADMIN) {
            throw new BusinessRuleException("Only the owner or admin can update this combo");
        }

        combo.setTitle(request.title().trim());
        combo.setSlug(SlugUtils.slugify(request.title()));
        combo.setDescription(request.description());
        if (request.categoryIds() != null && !request.categoryIds().isEmpty()) {
            combo.setCategoryIds(new java.util.LinkedHashSet<>(request.categoryIds()));
        } else if (request.categoryId() != null) {
            combo.setCategoryId(request.categoryId());
        }
        combo.setPrice(request.price());
        combo.setUpdatedAt(Instant.now());

        if (request.status() != null) {
            combo.setStatus(BookJpaEntity.BookStatusJpa.valueOf(request.status().toUpperCase()));
        }

        setupComboItemsAndDetails(combo, request.items(), request.stockQuantity(), request.imageUrls());
        comboItemRepository.deleteByComboBookId(comboId);
        BookJpaEntity saved = bookJpaRepository.save(combo);
        saveComboItems(saved, request.items());

        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteCombo(UUID comboId, String sellerEmail) {
        User seller = getSeller(sellerEmail);
        BookJpaEntity combo = bookJpaRepository.findById(comboId)
                .orElseThrow(() -> new ResourceNotFoundException("Combo", "id", comboId));

        if (!combo.getSellerId().equals(seller.getId().value()) && seller.getRole() != com.boki.domain.model.user.UserRole.ADMIN) {
            throw new BusinessRuleException("Only the owner or admin can delete this combo");
        }

        comboItemRepository.deleteByComboBookId(comboId);
        bookJpaRepository.delete(combo);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookResponse> getCombos(int page, int size) {
        List<BookJpaEntity> list = bookJpaRepository.findByStatusAndIsCombo(
                BookJpaEntity.BookStatusJpa.ACTIVE, true, PageRequest.of(page, size)
        ).getContent();
        return toResponseList(list);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookResponse> getCombosForBook(String idOrSlug) {
        List<BookJpaEntity> combos;
        try {
            UUID id = UUID.fromString(idOrSlug);
            combos = comboItemRepository.findCombosContainingSingleBook(id);
        } catch (IllegalArgumentException e) {
            combos = comboItemRepository.findCombosContainingSingleBookSlug(idOrSlug);
        }
        return toResponseList(combos);
    }

    private User getSeller(String sellerEmail) {
        return userRepository.findByEmail(Email.of(sellerEmail))
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", sellerEmail));
    }

    private void setupComboItemsAndDetails(BookJpaEntity combo, List<ComboItemInput> items, Integer stock, List<String> images) {
        int calculatedStock = Integer.MAX_VALUE;
        Set<String> authors = new LinkedHashSet<>();

        for (ComboItemInput item : items) {
            BookJpaEntity single = bookJpaRepository.findById(item.singleBookId())
                    .orElseThrow(() -> new ResourceNotFoundException("Book", "id", item.singleBookId()));
            if (single.getAuthor() != null) authors.add(single.getAuthor());

            int itemStock = single.getStockQuantity();
            if (item.variantId() != null) {
                BookVariantJpaEntity variant = variantRepository.findById(item.variantId())
                        .orElseThrow(() -> new ResourceNotFoundException("Variant", "id", item.variantId()));
                itemStock = variant.getStockQuantity();
            }
            int availableCombos = itemStock / Math.max(item.quantity(), 1);
            if (availableCombos < calculatedStock) calculatedStock = availableCombos;
        }

        combo.setAuthor(authors.size() == 1 ? authors.iterator().next() : "Nhiều tác giả");
        combo.setStockQuantity(stock != null && stock > 0 ? stock : Math.max(calculatedStock, 0));

        combo.getImages().clear();
        if (images != null && !images.isEmpty()) {
            for (int i = 0; i < images.size(); i++) {
                BookImageJpaEntity img = new BookImageJpaEntity();
                img.setImageUrl(images.get(i));
                img.setSortOrder(i);
                img.setPrimary(i == 0);
                combo.addImage(img);
            }
        }
    }

    private void saveComboItems(BookJpaEntity combo, List<ComboItemInput> items) {
        for (ComboItemInput item : items) {
            BookJpaEntity single = bookJpaRepository.findById(item.singleBookId()).orElse(null);
            BookVariantJpaEntity variant = item.variantId() != null ? variantRepository.findById(item.variantId()).orElse(null) : null;
            if (single != null) {
                BookComboItemJpaEntity entity = new BookComboItemJpaEntity(
                        combo, single, variant, Math.max(item.quantity(), 1), item.sortOrder()
                );
                comboItemRepository.save(entity);
            }
        }
    }

    private BookResponse toResponse(BookJpaEntity entity) {
        Book domain = BookPersistenceMapper.toDomainModel(entity);
        return bookDtoMapper.toResponse(domain);
    }

    private List<BookResponse> toResponseList(List<BookJpaEntity> entities) {
        List<Book> domainList = entities.stream()
                .map(BookPersistenceMapper::toDomainModel)
                .collect(Collectors.toList());
        return bookDtoMapper.toResponseList(domainList);
    }
}
