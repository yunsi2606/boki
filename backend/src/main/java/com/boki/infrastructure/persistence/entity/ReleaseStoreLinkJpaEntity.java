package com.boki.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "release_store_links")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReleaseStoreLinkJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "schedule_id", nullable = false)
    private UUID scheduleId;

    @Column(name = "edition_id")
    private UUID editionId;

    @Column(name = "platform", length = 50, nullable = false)
    private String platform; // BOKI_STORE, SHOPEE, TIKTOK_SHOP, FAHASA, OTHER

    @Column(name = "store_name", length = 100)
    private String storeName;

    @Column(name = "product_url", length = 1000, nullable = false)
    private String productUrl;

    @Column(name = "market_price", precision = 12, scale = 2)
    private BigDecimal marketPrice;

    @Column(name = "is_preorder", nullable = false)
    @Builder.Default
    private Boolean isPreorder = false;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
