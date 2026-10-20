package com.boki.infrastructure.persistence.entity;

import com.boki.domain.model.schedule.ReleaseScheduleStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
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

    @Column(name = "artist", length = 255)
    private String artist;

    @Column(name = "imprint", length = 100)
    private String imprint;

    @Column(name = "genres", length = 500)
    private String genres;

    @Column(name = "format", length = 50)
    @Builder.Default
    private String format = "MANGA";

    @Column(name = "series_status", length = 50)
    @Builder.Default
    private String seriesStatus = "ONGOING";

    @Column(name = "age_rating", length = 50)
    @Builder.Default
    private String ageRating = "13+";

    @Column(name = "specs", columnDefinition = "TEXT")
    private String specs;

    @Column(name = "release_date", nullable = false)
    private LocalDate releaseDate;

    @Column(name = "pre_order_date")
    private LocalDate preOrderDate;

    @Column(name = "cover_url", length = 500)
    private String coverUrl;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    @Builder.Default
    private ReleaseScheduleStatus status = ReleaseScheduleStatus.SCHEDULED;

    @Column(name = "slug", length = 255, unique = true)
    private String slug;

    @Column(name = "series_name", length = 255)
    private String seriesName;

    @Column(name = "series_slug", length = 255)
    private String seriesSlug;

    @Column(name = "volume_number")
    private Integer volumeNumber;

    @Column(name = "total_volumes")
    private Integer totalVolumes;

    @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("sortOrder ASC")
    @Builder.Default
    private List<ReleaseScheduleEditionJpaEntity> editions = new ArrayList<>();

    @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("sortOrder ASC")
    @Builder.Default
    private List<ReleaseStoreLinkJpaEntity> storeLinks = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id")
    @OrderBy("createdAt DESC")
    @Builder.Default
    private List<ReleaseChangelogJpaEntity> changelogs = new ArrayList<>();

    @Column(name = "views_count", nullable = false)
    @Builder.Default
    private int viewsCount = 0;

    @Column(name = "likes_count", nullable = false)
    @Builder.Default
    private int likesCount = 0;

    @Column(nullable = false, precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal rating = BigDecimal.valueOf(5.0);

    @Column(name = "reviews_count", nullable = false)
    @Builder.Default
    private int reviewsCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();
}
