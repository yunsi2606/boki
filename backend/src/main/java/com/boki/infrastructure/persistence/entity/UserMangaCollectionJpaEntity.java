package com.boki.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_manga_collections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserMangaCollectionJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "schedule_id", nullable = false)
    private UUID scheduleId;

    @Column(name = "edition_id")
    private UUID editionId;

    @Column(name = "status", length = 30, nullable = false)
    @Builder.Default
    private String status = "OWNED"; // OWNED, SEEKING, WISHLIST, DROPPED

    @Column(name = "purchase_price", precision = 12, scale = 2)
    private BigDecimal purchasePrice;

    @Column(name = "purchase_place", length = 100)
    private String purchasePlace;

    @Column(name = "purchased_at")
    private LocalDate purchasedAt;

    @Column(name = "reading_status", length = 30, nullable = false)
    @Builder.Default
    private String readingStatus = "UNREAD"; // UNREAD, READING, COMPLETED

    @Column(name = "personal_rating")
    private Short personalRating;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();
}
