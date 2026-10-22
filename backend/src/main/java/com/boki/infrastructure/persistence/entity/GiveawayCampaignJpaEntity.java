package com.boki.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "giveaway_campaigns")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GiveawayCampaignJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Column(name = "slug", length = 255, nullable = false, unique = true)
    private String slug;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "banner_url", length = 500)
    private String bannerUrl;

    @Column(name = "schedule_id")
    private UUID scheduleId;

    @Column(name = "prize_structure_type", length = 20, nullable = false)
    @Builder.Default
    private String prizeStructureType = "TIERED"; // TIERED, FLAT

    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private String status = "OPEN"; // UPCOMING, OPEN, CLOSED, DRAWN

    @Column(name = "start_date", nullable = false)
    @Builder.Default
    private OffsetDateTime startDate = OffsetDateTime.now();

    @Column(name = "end_date", nullable = false)
    private OffsetDateTime endDate;

    @Column(name = "draw_date")
    private OffsetDateTime drawDate;

    @Column(name = "winning_number")
    private Integer winningNumber;

    @Column(name = "total_winners_count", nullable = false)
    @Builder.Default
    private Integer totalWinnersCount = 0;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<GiveawayPrizeJpaEntity> prizes = new ArrayList<>();
}
