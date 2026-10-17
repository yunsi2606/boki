package com.boki.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "manga_tier_list_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MangaTierListItemJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "tier_list_id", nullable = false)
    private UUID tierListId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tier_list_id", insertable = false, updatable = false)
    private MangaTierListJpaEntity tierList;

    @Column(name = "schedule_id", nullable = false)
    private UUID scheduleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", insertable = false, updatable = false)
    private ReleaseScheduleJpaEntity schedule;

    @Column(name = "tier_rank", length = 20, nullable = false)
    @Builder.Default
    private String tierRank = "S";

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
