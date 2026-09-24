package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.BookVariantJpaEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookVariantJpaRepository extends JpaRepository<BookVariantJpaEntity, UUID> {
    List<BookVariantJpaEntity> findByBookId(UUID bookId);

    @Query("SELECT v FROM BookVariantJpaEntity v JOIN FETCH v.book WHERE v.book.id IN :bookIds")
    List<BookVariantJpaEntity> findByBookIds(@Param("bookIds") Collection<UUID> bookIds);
}
