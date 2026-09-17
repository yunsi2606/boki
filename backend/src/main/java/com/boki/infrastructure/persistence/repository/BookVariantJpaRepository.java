package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.BookVariantJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BookVariantJpaRepository extends JpaRepository<BookVariantJpaEntity, UUID> {
    List<BookVariantJpaEntity> findByBookId(UUID bookId);
}
