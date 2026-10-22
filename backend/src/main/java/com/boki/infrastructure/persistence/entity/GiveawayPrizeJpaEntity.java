package com.boki.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "giveaway_prizes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GiveawayPrizeJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private GiveawayCampaignJpaEntity campaign;

    @Column(name = "prize_tier", length = 30, nullable = false)
    @Builder.Default
    private String prizeTier = "FIRST"; // FIRST, SECOND, THIRD, CONSOLATION, STANDARD

    @Column(name = "prize_name", length = 255, nullable = false)
    private String prizeName;

    @Column(name = "quantity", nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 1;
}
