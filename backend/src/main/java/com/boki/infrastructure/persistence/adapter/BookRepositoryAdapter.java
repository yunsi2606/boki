package com.boki.infrastructure.persistence.adapter;

import com.boki.domain.model.book.Book;
import com.boki.domain.model.book.BookId;
import com.boki.domain.model.book.BookStatus;
import com.boki.domain.model.user.UserId;
import com.boki.domain.port.out.BookRepository;
import com.boki.infrastructure.persistence.entity.BookJpaEntity;
import com.boki.infrastructure.persistence.mapper.BookPersistenceMapper;
import com.boki.infrastructure.persistence.repository.BookJpaRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class BookRepositoryAdapter implements BookRepository {

    private final BookJpaRepository jpaRepository;

    public BookRepositoryAdapter(BookJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Book save(Book book) {
        BookJpaEntity entity = BookPersistenceMapper.toJpaEntity(book);
        BookJpaEntity savedEntity = jpaRepository.save(entity);
        return BookPersistenceMapper.toDomainModel(savedEntity);
    }

    @Override
    public Optional<Book> findById(BookId id) {
        return jpaRepository.findById(id.value())
                .map(BookPersistenceMapper::toDomainModel);
    }

    @Override
    public List<Book> findByStatus(BookStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        BookJpaEntity.BookStatusJpa jpaStatus = BookJpaEntity.BookStatusJpa.valueOf(status.name());
        return jpaRepository.findByStatus(jpaStatus, pageable)
                .getContent()
                .stream()
                .map(BookPersistenceMapper::toDomainModel)
                .collect(Collectors.toList());
    }

    @Override
    public List<Book> findBySellerId(UserId sellerId) {
        return jpaRepository.findBySellerId(sellerId.value())
                .stream()
                .map(BookPersistenceMapper::toDomainModel)
                .collect(Collectors.toList());
    }

    @Override
    public List<Book> searchActive(Integer categoryId, String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        BookJpaEntity.BookStatusJpa activeStatus = BookJpaEntity.BookStatusJpa.ACTIVE;

        if (categoryId != null && query != null && !query.isBlank()) {
            return jpaRepository.searchActiveBooksByCategory(activeStatus, categoryId, query, pageable)
                    .getContent().stream()
                    .map(BookPersistenceMapper::toDomainModel)
                    .collect(Collectors.toList());
        } else if (categoryId != null) {
            return jpaRepository.findByStatusAndCategoryId(activeStatus, categoryId, pageable)
                    .getContent().stream()
                    .map(BookPersistenceMapper::toDomainModel)
                    .collect(Collectors.toList());
        } else if (query != null && !query.isBlank()) {
            return jpaRepository.searchActiveBooks(activeStatus, query, pageable)
                    .getContent().stream()
                    .map(BookPersistenceMapper::toDomainModel)
                    .collect(Collectors.toList());
        } else {
            return jpaRepository.findByStatus(activeStatus, pageable)
                    .getContent().stream()
                    .map(BookPersistenceMapper::toDomainModel)
                    .collect(Collectors.toList());
        }
    }

    @Override
    public void deleteById(BookId id) {
        jpaRepository.deleteById(id.value());
    }
}
