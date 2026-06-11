package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.BookImageJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface BookImageJpaRepository extends JpaRepository<BookImageJpaEntity, UUID> {
}
