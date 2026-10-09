package com.boki.infrastructure.persistence.entity;

import com.boki.domain.model.schedule.ReleaseEditionType;
import com.boki.domain.model.schedule.ReleaseScheduleStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "release_schedule_editions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReleaseScheduleEditionJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private ReleaseScheduleJpaEntity schedule;

    public UUID getScheduleId() {
        return schedule != null ? schedule.getId() : null;
    }

    @Column(name = "edition_name", length = 100, nullable = false)
    private String editionName;

    @Enumerated(EnumType.STRING)
    @Column(name = "edition_type", length = 50, nullable = false)
    @Builder.Default
    private ReleaseEditionType editionType = ReleaseEditionType.STANDARD;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "pre_order_date")
    private LocalDate preOrderDate;

    @Column(name = "estimated_price", precision = 12, scale = 2)
    private BigDecimal estimatedPrice;

    @Column(name = "gifts", columnDefinition = "TEXT")
    private String gifts;

    @Column(name = "cover_url", length = 500)
    private String coverUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    @Builder.Default
    private ReleaseScheduleStatus status = ReleaseScheduleStatus.SCHEDULED;

    @Column(name = "book_id")
    private UUID bookId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", insertable = false, updatable = false)
    private BookJpaEntity book;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public LocalDate getEffectiveReleaseDate() {
        if (releaseDate != null) return releaseDate;
        return schedule != null ? schedule.getReleaseDate() : null;
    }

    public LocalDate getEffectivePreOrderDate() {
        if (preOrderDate != null) return preOrderDate;
        return schedule != null ? schedule.getPreOrderDate() : null;
    }
}
