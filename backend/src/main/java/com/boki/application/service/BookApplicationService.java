package com.boki.application.service;

import com.boki.application.dto.request.CreateBookRequest;
import com.boki.application.dto.request.UpdateBookRequest;
import com.boki.application.dto.response.BookResponse;
import com.boki.application.exception.BusinessRuleException;
import com.boki.application.exception.ResourceNotFoundException;
import com.boki.application.mapper.BookDtoMapper;
import com.boki.application.port.in.GetBookUseCase;
import com.boki.application.port.in.ManageBookUseCase;
import com.boki.domain.model.book.*;
import com.boki.domain.model.user.Email;
import com.boki.domain.model.user.User;
import com.boki.domain.model.user.UserId;
import com.boki.domain.port.out.BookRepository;
import com.boki.domain.port.out.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookApplicationService implements ManageBookUseCase, GetBookUseCase {

    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final BookDtoMapper bookDtoMapper;
    private final com.boki.infrastructure.persistence.repository.BookVariantJpaRepository variantRepository;

    public BookApplicationService(
            BookRepository bookRepository,
            UserRepository userRepository,
            BookDtoMapper bookDtoMapper,
            com.boki.infrastructure.persistence.repository.BookVariantJpaRepository variantRepository
    ) {
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.bookDtoMapper = bookDtoMapper;
        this.variantRepository = variantRepository;
    }

    @Override
    @Transactional
    public BookResponse createBook(CreateBookRequest request, String sellerEmail) {
        User seller = userRepository.findByEmail(Email.of(sellerEmail))
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", sellerEmail));

        if (!seller.isPhoneVerified()) {
            throw new BusinessRuleException("Phone number verification is required before listing a book");
        }

        // Automatic seller role upgrade
        if (seller.getRole() == com.boki.domain.model.user.UserRole.BUYER) {
            seller.upgradeToSeller();
            userRepository.save(seller);
        }

        Price price = Price.of(request.price());
        BookCondition condition = BookCondition.valueOf(request.condition().toUpperCase());
        
        Book book = Book.create(
                seller.getId(),
                request.title(),
                request.author(),
                price,
                condition,
                request.stockQuantity(),
                request.imageUrls()
        );

        book.updateDetails(
                request.title(), request.author(), request.isbn(), request.description(), request.categoryId(),
                request.publicationDetails()
        );

        book.updatePreOrder(request.isPreOrder(), request.preOrderDays());
        book.updateMaxOrderQuantity(request.maxOrderQuantity());
        
        // Auto publish listed books for immediate browsing
        book.publish();

        Book savedBook = bookRepository.save(book);
        return bookDtoMapper.toResponse(savedBook);
    }

    @Override
    @Transactional
    public BookResponse updateBook(UUID bookId, UpdateBookRequest request, String sellerEmail) {
        User seller = userRepository.findByEmail(Email.of(sellerEmail))
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", sellerEmail));

        Book book = bookRepository.findById(BookId.of(bookId))
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", bookId));

        if (!book.getSellerId().equals(seller.getId())) {
            throw new BusinessRuleException("Only the seller can modify this book listing");
        }

        book.updateDetails(
                request.title(), request.author(), request.isbn(), request.description(), request.categoryId(),
                request.publicationDetails()
        );
        
        if (request.price() != null) {
            book.updatePrice(Price.of(request.price()));
        }
        if (request.condition() != null) {
            book.updateCondition(BookCondition.valueOf(request.condition().toUpperCase()));
        }
        List<com.boki.infrastructure.persistence.entity.BookVariantJpaEntity> variants =
                variantRepository.findByBookId(bookId);
        if (variants != null && !variants.isEmpty()) {
            int totalVariantStock = variants.stream()
                    .mapToInt(com.boki.infrastructure.persistence.entity.BookVariantJpaEntity::getStockQuantity)
                    .sum();
            book.updateStockQuantity(totalVariantStock);
        } else if (request.stockQuantity() != null) {
            book.updateStockQuantity(request.stockQuantity());
        }
        if (request.imageUrls() != null) {
            book.updateImages(request.imageUrls());
        }
        if (request.isPreOrder() != null) {
            book.updatePreOrder(request.isPreOrder(), request.preOrderDays());
        }
        if (request.maxOrderQuantity() != null) {
            book.updateMaxOrderQuantity(request.maxOrderQuantity());
        }

        Book savedBook = bookRepository.save(book);
        return bookDtoMapper.toResponse(savedBook);
    }

    @Override
    @Transactional
    public void deleteBook(UUID bookId, String sellerEmail) {
        User seller = userRepository.findByEmail(Email.of(sellerEmail))
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", sellerEmail));

        Book book = bookRepository.findById(BookId.of(bookId))
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", bookId));

        if (!book.getSellerId().equals(seller.getId())) {
            throw new BusinessRuleException("Only the seller can delete this book listing");
        }

        bookRepository.deleteById(book.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public BookResponse getBook(UUID bookId) {
        Book book = bookRepository.findById(BookId.of(bookId))
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", bookId));
        return bookDtoMapper.toResponse(book);
    }

    @Override
    @Transactional(readOnly = true)
    public BookResponse getBookBySlug(String slug) {
        Book book = bookRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "slug", slug));
        return bookDtoMapper.toResponse(book);
    }

    @Override
    @Transactional
    public void incrementViews(String idOrSlug) {
        try {
            UUID uuid = UUID.fromString(idOrSlug);
            bookRepository.incrementViews(BookId.of(uuid));
        } catch (IllegalArgumentException e) {
            bookRepository.findBySlug(idOrSlug)
                    .ifPresent(book -> bookRepository.incrementViews(book.getId()));
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookResponse> searchBooks(Integer categoryId, String query, int page, int size) {
        List<Book> books = bookRepository.searchActive(categoryId, query, page, size);
        return bookDtoMapper.toResponseList(books);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookResponse> getAdminBooks(String query, int page, int size) {
        List<Book> books = bookRepository.searchAll(query, page, size);
        return bookDtoMapper.toResponseList(books);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookResponse> getSellerBooks(String sellerEmail) {
        User seller = userRepository.findByEmail(Email.of(sellerEmail))
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", sellerEmail));

        List<Book> books = bookRepository.findBySellerId(seller.getId());
        return bookDtoMapper.toResponseList(books);
    }
}
