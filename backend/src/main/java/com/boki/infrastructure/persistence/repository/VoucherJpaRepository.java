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

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE VoucherJpaEntity v SET v.applicableCategoryId = null, v.applicableCategoryName = null WHERE v.applicableCategoryId = :categoryId")
    void clearApplicableCategory(@org.springframework.data.repository.query.Param("categoryId") Integer categoryId);
}
