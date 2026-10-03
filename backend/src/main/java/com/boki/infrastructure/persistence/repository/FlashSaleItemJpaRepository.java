package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.FlashSaleItemJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FlashSaleItemJpaRepository extends JpaRepository<FlashSaleItemJpaEntity, UUID> {

    List<FlashSaleItemJpaEntity> findByFlashSaleId(UUID flashSaleId);

    @Modifying
    @Query("DELETE FROM FlashSaleItemJpaEntity fsi WHERE fsi.flashSale.id = :flashSaleId")
    void deleteByFlashSaleId(@Param("flashSaleId") UUID flashSaleId);

    @Query("""
        SELECT fsi FROM FlashSaleItemJpaEntity fsi
        JOIN fsi.flashSale fs
        WHERE fsi.bookId = :bookId
          AND fs.status = 'ACTIVE'
          AND fs.startTime <= :now
          AND fs.endTime >= :now
          AND fsi.soldQuantity < fsi.quantityLimit
        ORDER BY fsi.flashSalePrice ASC
    """)
    List<FlashSaleItemJpaEntity> findActiveAvailableItemsForBook(
            @Param("bookId") UUID bookId,
            @Param("now") OffsetDateTime now
    );

    @Modifying
    @Query("""
        UPDATE FlashSaleItemJpaEntity fsi
        SET fsi.soldQuantity = fsi.soldQuantity + :qty
        WHERE fsi.id = :itemId AND (fsi.soldQuantity + :qty) <= fsi.quantityLimit
    """)
    int incrementSoldQuantity(@Param("itemId") UUID itemId, @Param("qty") int qty);
}
