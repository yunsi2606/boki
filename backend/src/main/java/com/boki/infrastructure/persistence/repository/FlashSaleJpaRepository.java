package com.boki.infrastructure.persistence.repository;

import com.boki.domain.model.flashsale.FlashSaleStatus;
import com.boki.infrastructure.persistence.entity.FlashSaleJpaEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FlashSaleJpaRepository extends JpaRepository<FlashSaleJpaEntity, UUID> {

    List<FlashSaleJpaEntity> findAllByOrderByStartTimeDesc();

    @Query("SELECT fs FROM FlashSaleJpaEntity fs WHERE fs.status = :status AND fs.startTime <= :now AND fs.endTime >= :now ORDER BY fs.startTime ASC")
    List<FlashSaleJpaEntity> findActiveSales(@Param("status") FlashSaleStatus status, @Param("now") OffsetDateTime now);

    @Query("SELECT fs FROM FlashSaleJpaEntity fs WHERE fs.status = 'ACTIVE' AND fs.startTime <= :now AND fs.endTime >= :now ORDER BY fs.startTime ASC")
    Optional<FlashSaleJpaEntity> findFirstActiveSale(@Param("now") OffsetDateTime now);

    @Query("SELECT fs FROM FlashSaleJpaEntity fs WHERE (fs.status = 'SCHEDULED' OR fs.status = 'ACTIVE') AND fs.endTime > :now ORDER BY fs.startTime ASC")
    List<FlashSaleJpaEntity> findUpcomingOrActiveSales(@Param("now") OffsetDateTime now, Pageable pageable);

    @Query("SELECT fs FROM FlashSaleJpaEntity fs WHERE fs.status = 'SCHEDULED' AND fs.startTime <= :now AND fs.endTime >= :now")
    List<FlashSaleJpaEntity> findSalesToActivate(@Param("now") OffsetDateTime now);

    @Query("SELECT fs FROM FlashSaleJpaEntity fs WHERE fs.status = 'ACTIVE' AND fs.endTime < :now")
    List<FlashSaleJpaEntity> findSalesToExpire(@Param("now") OffsetDateTime now);
}
