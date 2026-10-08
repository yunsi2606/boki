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
@Table(name = "release_schedules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReleaseScheduleJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Column(name = "original_title", length = 255)
    private String originalTitle;

    @Column(name = "publisher", length = 100, nullable = false)
    private String publisher;

    @Column(name = "author", length = 255)
    private String author;

    @Column(name = "release_date", nullable = false)
    private LocalDate releaseDate;

    @Column(name = "estimated_price", precision = 12, scale = 2)
    private BigDecimal estimatedPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "edition_type", length = 50, nullable = false)
    @Builder.Default
    private ReleaseEditionType editionType = ReleaseEditionType.STANDARD;

    @Column(name = "gifts", columnDefinition = "TEXT")
    private String gifts;

    @Column(name = "cover_url", length = 500)
    private String coverUrl;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    @Builder.Default
    private ReleaseScheduleStatus status = ReleaseScheduleStatus.SCHEDULED;

    @Column(name = "book_id")
    private UUID bookId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", insertable = false, updatable = false)
    private BookJpaEntity book;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();
}
