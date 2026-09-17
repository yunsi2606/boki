package com.boki.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "vouchers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherJpaEntity {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "code", length = 50, nullable = false, unique = true)
    private String code;

    @Column(name = "type", length = 20, nullable = false)
    private String type; // SHIPPING or PRODUCT

    @Builder.Default
    @Column(name = "discount_type", length = 30, nullable = false)
    private String discountType = "FIXED_AMOUNT"; // FIXED_AMOUNT, PERCENTAGE, FREE_SHIPPING

    @Column(name = "tag", length = 100, nullable = false)
    private String tag;

    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "discount_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal discountAmount;

    @Column(name = "max_discount_amount", precision = 12, scale = 2)
    private BigDecimal maxDiscountAmount;

    @Column(name = "min_order_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal minOrderAmount;

    @Column(name = "usage_limit", nullable = false)
    private Integer usageLimit;

    @Column(name = "used_count", nullable = false)
    private Integer usedCount;

    @Builder.Default
    @Column(name = "user_usage_limit", nullable = false)
    private Integer userUsageLimit = 1;

    @Column(name = "applicable_category_id")
    private Integer applicableCategoryId;

    @Column(name = "applicable_category_name", length = 100)
    private String applicableCategoryName;

    @Builder.Default
    @Column(name = "user_scope", length = 30, nullable = false)
    private String userScope = "ALL"; // ALL, NEW_USER, VIP_USER

    @Column(name = "start_date")
    private OffsetDateTime startDate;

    @Column(name = "end_date")
    private OffsetDateTime endDate;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    public void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = OffsetDateTime.now();
        }
        if (this.usedCount == null) {
            this.usedCount = 0;
        }
        if (this.isActive == null) {
            this.isActive = true;
        }
        if (this.discountType == null) {
            this.discountType = "FIXED_AMOUNT";
        }
        if (this.userUsageLimit == null) {
            this.userUsageLimit = 1;
        }
        if (this.userScope == null) {
            this.userScope = "ALL";
        }
    }
}
