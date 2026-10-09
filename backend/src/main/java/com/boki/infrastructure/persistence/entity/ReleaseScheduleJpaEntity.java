package com.boki.infrastructure.persistence.entity;

import com.boki.domain.model.schedule.ReleaseScheduleStatus;
import jakarta.persistence.*;
import lombok.*;

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

    @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("sortOrder ASC")
    @Builder.Default
    private List<ReleaseScheduleEditionJpaEntity> editions = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();
}
