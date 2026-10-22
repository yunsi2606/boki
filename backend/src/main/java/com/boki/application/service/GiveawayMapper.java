package com.boki.application.service;

import com.boki.application.dto.giveaway.*;
import com.boki.infrastructure.persistence.entity.GiveawayCampaignJpaEntity;
import com.boki.infrastructure.persistence.entity.GiveawayEntryJpaEntity;
import com.boki.infrastructure.persistence.entity.GiveawayPrizeJpaEntity;

import java.util.Collections;
import java.util.List;

public class GiveawayMapper {

    public static GiveawayPrizeDto toPrizeDto(GiveawayPrizeJpaEntity entity) {
        return toPrizeDto(entity, null, null);
    }

    public static GiveawayPrizeDto toPrizeDto(GiveawayPrizeJpaEntity entity, String scheduleTitle, String scheduleCoverUrl) {
        if (entity == null) return null;
        return GiveawayPrizeDto.builder()
                .id(entity.getId())
                .prizeTier(entity.getPrizeTier())
                .prizeName(entity.getPrizeName())
                .quantity(entity.getQuantity())
                .displayOrder(entity.getDisplayOrder())
                .scheduleId(entity.getScheduleId())
                .scheduleTitle(scheduleTitle)
                .scheduleCoverUrl(scheduleCoverUrl)
                .build();
    }

    public static GiveawayEntryDto toEntryDto(GiveawayEntryJpaEntity entity) {
        if (entity == null) return null;
        return GiveawayEntryDto.builder()
                .id(entity.getId())
                .campaignId(entity.getCampaign() != null ? entity.getCampaign().getId() : null)
                .fullName(entity.getFullName())
                .email(maskEmail(entity.getEmail()))
                .phone(maskPhone(entity.getPhone()))
                .luckyNumber(entity.getLuckyNumber())
                .comment(entity.getComment())
                .isWinner(entity.getIsWinner())
                .prizeId(entity.getPrize() != null ? entity.getPrize().getId() : null)
                .prizeName(entity.getPrize() != null ? entity.getPrize().getPrizeName() : null)
                .prizeTier(entity.getPrize() != null ? entity.getPrize().getPrizeTier() : null)
                .prizeRank(entity.getPrizeRank())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public static GiveawayCampaignDto toCampaignDto(GiveawayCampaignJpaEntity entity, long entriesCount) {
        if (entity == null) return null;
        return GiveawayCampaignDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .slug(entity.getSlug())
                .description(entity.getDescription())
                .bannerUrl(entity.getBannerUrl())
                .scheduleId(entity.getScheduleId())
                .prizeStructureType(entity.getPrizeStructureType())
                .status(entity.getStatus())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .drawDate(entity.getDrawDate())
                .winningNumber(entity.getWinningNumber())
                .totalWinnersCount(entity.getTotalWinnersCount())
                .totalEntriesCount(entriesCount)
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public static GiveawayCampaignDetailDto toDetailDto(
            GiveawayCampaignJpaEntity entity,
            long entriesCount,
            List<GiveawayPrizeDto> prizes,
            List<GiveawayEntryDto> winners,
            String scheduleTitle,
            String scheduleCoverUrl
    ) {
        if (entity == null) return null;
        return GiveawayCampaignDetailDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .slug(entity.getSlug())
                .description(entity.getDescription())
                .bannerUrl(entity.getBannerUrl())
                .scheduleId(entity.getScheduleId())
                .scheduleTitle(scheduleTitle)
                .scheduleCoverUrl(scheduleCoverUrl)
                .prizeStructureType(entity.getPrizeStructureType())
                .status(entity.getStatus())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .drawDate(entity.getDrawDate())
                .winningNumber(entity.getWinningNumber())
                .totalWinnersCount(entity.getTotalWinnersCount())
                .totalEntriesCount(entriesCount)
                .createdAt(entity.getCreatedAt())
                .prizes(prizes)
                .winners(winners != null ? winners : Collections.emptyList())
                .build();
    }

    public static String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        String[] parts = email.split("@");
        String name = parts[0];
        if (name.length() <= 3) {
            return name.charAt(0) + "***@" + parts[1];
        }
        return name.substring(0, 2) + "***" + name.charAt(name.length() - 1) + "@" + parts[1];
    }

    public static String maskPhone(String phone) {
        if (phone == null || phone.length() < 7) return phone;
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 3);
    }
}
