package com.boki.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "giveaway_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GiveawayEntryJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private GiveawayCampaignJpaEntity campaign;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "email", length = 255, nullable = false)
    private String email;

    @Column(name = "full_name", length = 255, nullable = false)
    private String fullName;

    @Column(name = "phone", length = 50, nullable = false)
    private String phone;

    @Column(name = "lucky_number", nullable = false)
    private Integer luckyNumber;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "is_winner", nullable = false)
    @Builder.Default
    private Boolean isWinner = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prize_id")
    private GiveawayPrizeJpaEntity prize;

    @Column(name = "prize_rank")
    private Integer prizeRank;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
