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

    public BookApplicationService(
            BookRepository bookRepository,
            UserRepository userRepository,
            BookDtoMapper bookDtoMapper
    ) {
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.bookDtoMapper = bookDtoMapper;
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

        book.updateDetails(request.title(), request.author(), request.isbn(), request.description(), request.categoryId());
        
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

        book.updateDetails(request.title(), request.author(), request.isbn(), request.description(), request.categoryId());
        
        if (request.price() != null) {
            book.updatePrice(Price.of(request.price()));
        }
        if (request.condition() != null) {
            book.updateCondition(BookCondition.valueOf(request.condition().toUpperCase()));
        }
        if (request.stockQuantity() != null) {
            book.updateStockQuantity(request.stockQuantity());
        }
        if (request.imageUrls() != null) {
            book.updateImages(request.imageUrls());
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
    public List<BookResponse> searchBooks(Integer categoryId, String query, int page, int size) {
        return bookRepository.searchActive(categoryId, query, page, size)
                .stream()
                .map(bookDtoMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookResponse> getSellerBooks(String sellerEmail) {
        User seller = userRepository.findByEmail(Email.of(sellerEmail))
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", sellerEmail));

        return bookRepository.findBySellerId(seller.getId())
                .stream()
                .map(bookDtoMapper::toResponse)
                .collect(Collectors.toList());
    }
}
