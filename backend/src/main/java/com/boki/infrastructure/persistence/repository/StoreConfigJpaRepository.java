package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.StoreConfigJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StoreConfigJpaRepository extends JpaRepository<StoreConfigJpaEntity, String> {
}
