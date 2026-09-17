package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.VoucherJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherJpaRepository extends JpaRepository<VoucherJpaEntity, String> {
    List<VoucherJpaEntity> findByIsActiveTrue();
    Optional<VoucherJpaEntity> findByCode(String code);
}
