package com.boki.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "flash_sale_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashSaleItemJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flash_sale_id", nullable = false)
    private FlashSaleJpaEntity flashSale;

    @Column(name = "book_id", nullable = false)
    private UUID bookId;

    @Column(name = "original_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal originalPrice;

    @Column(name = "flash_sale_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal flashSalePrice;

    @Column(name = "discount_percent", nullable = false)
    private Integer discountPercent;

    @Column(name = "quantity_limit", nullable = false)
    private Integer quantityLimit;

    @Column(name = "sold_quantity", nullable = false)
    @Builder.Default
    private Integer soldQuantity = 0;

    @Column(name = "user_limit", nullable = false)
    @Builder.Default
    private Integer userLimit = 2;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
