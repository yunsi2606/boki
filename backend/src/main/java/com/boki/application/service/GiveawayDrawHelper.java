package com.boki.application.service;

import com.boki.application.dto.giveaway.DrawCandidateDto;
import com.boki.application.dto.giveaway.DrawPreviewResponse;
import com.boki.infrastructure.persistence.entity.GiveawayCampaignJpaEntity;
import com.boki.infrastructure.persistence.entity.GiveawayEntryJpaEntity;
import com.boki.infrastructure.persistence.entity.GiveawayPrizeJpaEntity;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class GiveawayDrawHelper {

    public static DrawPreviewResponse computeDraw(
            GiveawayCampaignJpaEntity campaign,
            List<GiveawayPrizeJpaEntity> prizes,
            List<GiveawayEntryJpaEntity> rankedEntries,
            Integer winningNumber
    ) {
        List<GiveawayPrizeJpaEntity> prizeSlots = expandPrizeSlots(prizes);
        int totalSlots = prizeSlots.size();
        List<DrawCandidateDto> candidateDtos = new ArrayList<>();

        for (int i = 0; i < rankedEntries.size(); i++) {
            GiveawayEntryJpaEntity entry = rankedEntries.get(i);
            int rank = i + 1;
            boolean isWinner = i < totalSlots;
            GiveawayPrizeJpaEntity prize = isWinner ? prizeSlots.get(i) : null;
            int distance = Math.abs(entry.getLuckyNumber() - winningNumber);

            DrawCandidateDto dto = DrawCandidateDto.builder()
                    .rank(rank)
                    .entryId(entry.getId())
                    .fullName(entry.getFullName())
                    .email(GiveawayMapper.maskEmail(entry.getEmail()))
                    .phone(GiveawayMapper.maskPhone(entry.getPhone()))
                    .luckyNumber(entry.getLuckyNumber())
                    .distance(distance)
                    .submittedAt(entry.getCreatedAt())
                    .prizeId(prize != null ? prize.getId() : null)
                    .prizeName(prize != null ? prize.getPrizeName() : null)
                    .prizeTier(prize != null ? prize.getPrizeTier() : null)
                    .isWinner(isWinner)
                    .build();

            candidateDtos.add(dto);
        }

        return DrawPreviewResponse.builder()
                .campaignId(campaign.getId())
                .campaignTitle(campaign.getTitle())
                .winningNumber(winningNumber)
                .totalPrizes(totalSlots)
                .totalEntries(rankedEntries.size())
                .candidates(candidateDtos)
                .build();
    }

    public static List<GiveawayPrizeJpaEntity> expandPrizeSlots(List<GiveawayPrizeJpaEntity> prizes) {
        List<GiveawayPrizeJpaEntity> sortedPrizes = new ArrayList<>(prizes != null ? prizes : List.of());
        sortedPrizes.sort(Comparator.comparingInt(p -> p.getDisplayOrder() != null ? p.getDisplayOrder() : 1));

        List<GiveawayPrizeJpaEntity> slots = new ArrayList<>();
        for (GiveawayPrizeJpaEntity p : sortedPrizes) {
            int qty = p.getQuantity() != null && p.getQuantity() > 0 ? p.getQuantity() : 1;
            for (int i = 0; i < qty; i++) {
                slots.add(p);
            }
        }
        return slots;
    }
}
