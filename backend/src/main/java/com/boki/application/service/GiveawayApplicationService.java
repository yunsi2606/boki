package com.boki.application.service;

import com.boki.application.dto.giveaway.*;
import com.boki.application.exception.BusinessRuleException;
import com.boki.application.exception.ResourceNotFoundException;
import com.boki.infrastructure.persistence.entity.GiveawayCampaignJpaEntity;
import com.boki.infrastructure.persistence.entity.GiveawayEntryJpaEntity;
import com.boki.infrastructure.persistence.entity.GiveawayPrizeJpaEntity;
import com.boki.infrastructure.persistence.entity.ReleaseScheduleJpaEntity;
import com.boki.infrastructure.persistence.repository.GiveawayCampaignJpaRepository;
import com.boki.infrastructure.persistence.repository.GiveawayEntryJpaRepository;
import com.boki.infrastructure.persistence.repository.GiveawayPrizeJpaRepository;
import com.boki.infrastructure.persistence.repository.ReleaseScheduleJpaRepository;
import com.boki.infrastructure.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class GiveawayApplicationService {

    private final GiveawayCampaignJpaRepository campaignRepository;
    private final GiveawayPrizeJpaRepository prizeRepository;
    private final GiveawayEntryJpaRepository entryRepository;
    private final ReleaseScheduleJpaRepository releaseScheduleRepository;
    private final GiveawayEmailNotifier emailNotifier;

    @Transactional(readOnly = true)
    public Page<GiveawayCampaignDto> getPublicCampaigns(Pageable pageable) {
        return campaignRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(c -> GiveawayMapper.toCampaignDto(c, entryRepository.countByCampaignId(c.getId())));
    }

    @Transactional(readOnly = true)
    public GiveawayCampaignDetailDto getPublicCampaignDetail(String slug) {
        GiveawayCampaignJpaEntity campaign = campaignRepository.findBySlugWithPrizes(slug)
                .orElseThrow(() -> new ResourceNotFoundException("GiveawayCampaign", "slug", slug));

        long entriesCount = entryRepository.countByCampaignId(campaign.getId());
        List<GiveawayEntryDto> winners = Collections.emptyList();
        if ("DRAWN".equalsIgnoreCase(campaign.getStatus())) {
            winners = entryRepository.findWinnersByCampaignId(campaign.getId()).stream()
                    .map(GiveawayMapper::toEntryDto)
                    .toList();
        }

        String scheduleTitle = null;
        String scheduleCoverUrl = null;
        if (campaign.getScheduleId() != null) {
            Optional<ReleaseScheduleJpaEntity> sch = releaseScheduleRepository.findById(campaign.getScheduleId());
            if (sch.isPresent()) {
                scheduleTitle = sch.get().getTitle();
                scheduleCoverUrl = sch.get().getCoverUrl();
            }
        }

        return GiveawayMapper.toDetailDto(campaign, entriesCount, winners, scheduleTitle, scheduleCoverUrl);
    }

    @Transactional
    public GiveawayEntryDto submitEntry(String slug, GiveawaySubmitEntryRequest request, UUID userId) {
        GiveawayCampaignJpaEntity campaign = campaignRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("GiveawayCampaign", "slug", slug));

        if (!"OPEN".equalsIgnoreCase(campaign.getStatus())) {
            throw new BusinessRuleException("Sự kiện Give Away này hiện không nhận thêm lượt tham gia!");
        }

        OffsetDateTime now = OffsetDateTime.now();
        if (campaign.getStartDate() != null && now.isBefore(campaign.getStartDate())) {
            throw new BusinessRuleException("Sự kiện Give Away chưa bắt đầu!");
        }
        if (campaign.getEndDate() != null && now.isAfter(campaign.getEndDate())) {
            throw new BusinessRuleException("Sự kiện Give Away đã kết thúc!");
        }

        String email = request.getEmail().trim().toLowerCase();
        String phone = request.getPhone().trim();

        if (entryRepository.existsByCampaignIdAndEmail(campaign.getId(), email)) {
            throw new BusinessRuleException("Email " + email + " đã được dùng để tham gia sự kiện này rồi!");
        }
        if (entryRepository.existsByCampaignIdAndPhone(campaign.getId(), phone)) {
            throw new BusinessRuleException("Số điện thoại " + phone + " đã tham gia sự kiện này rồi!");
        }

        GiveawayEntryJpaEntity entry = GiveawayEntryJpaEntity.builder()
                .campaign(campaign)
                .userId(userId)
                .email(email)
                .fullName(request.getFullName().trim())
                .phone(phone)
                .luckyNumber(request.getLuckyNumber())
                .comment(request.getComment() != null ? request.getComment().trim() : null)
                .isWinner(false)
                .createdAt(OffsetDateTime.now())
                .build();

        GiveawayEntryJpaEntity saved = entryRepository.save(entry);
        emailNotifier.enqueueEntryConfirmation(campaign, saved);

        return GiveawayMapper.toEntryDto(saved);
    }

    @Transactional(readOnly = true)
    public Page<GiveawayCampaignDto> getAdminCampaigns(String status, Pageable pageable) {
        Page<GiveawayCampaignJpaEntity> page = (status != null && !status.isBlank())
                ? campaignRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
                : campaignRepository.findAllByOrderByCreatedAtDesc(pageable);

        return page.map(c -> GiveawayMapper.toCampaignDto(c, entryRepository.countByCampaignId(c.getId())));
    }

    @Transactional
    public GiveawayCampaignDetailDto createCampaign(CreateGiveawayCampaignRequest request) {
        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? SlugUtils.slugify(request.getSlug())
                : SlugUtils.slugify(request.getTitle()) + "-" + System.currentTimeMillis() % 10000;

        GiveawayCampaignJpaEntity campaign = GiveawayCampaignJpaEntity.builder()
                .title(request.getTitle().trim())
                .slug(slug)
                .description(request.getDescription())
                .bannerUrl(request.getBannerUrl())
                .scheduleId(request.getScheduleId())
                .prizeStructureType(request.getPrizeStructureType() != null ? request.getPrizeStructureType() : "TIERED")
                .status(request.getStatus() != null ? request.getStatus() : "OPEN")
                .startDate(request.getStartDate() != null ? request.getStartDate() : OffsetDateTime.now())
                .endDate(request.getEndDate())
                .totalWinnersCount(0)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        GiveawayCampaignJpaEntity saved = campaignRepository.save(campaign);
        savePrizes(saved, request.getPrizes());

        return getPublicCampaignDetail(saved.getSlug());
    }

    @Transactional
    public GiveawayCampaignDetailDto updateCampaign(UUID id, CreateGiveawayCampaignRequest request) {
        GiveawayCampaignJpaEntity campaign = campaignRepository.findByIdWithPrizes(id)
                .orElseThrow(() -> new ResourceNotFoundException("GiveawayCampaign", "id", id));

        campaign.setTitle(request.getTitle().trim());
        if (request.getSlug() != null && !request.getSlug().isBlank()) {
            campaign.setSlug(SlugUtils.slugify(request.getSlug()));
        }
        campaign.setDescription(request.getDescription());
        campaign.setBannerUrl(request.getBannerUrl());
        campaign.setScheduleId(request.getScheduleId());
        campaign.setPrizeStructureType(request.getPrizeStructureType());
        if (request.getStatus() != null) {
            campaign.setStatus(request.getStatus());
        }
        campaign.setStartDate(request.getStartDate());
        campaign.setEndDate(request.getEndDate());
        campaign.setUpdatedAt(OffsetDateTime.now());

        prizeRepository.deleteByCampaignId(id);
        savePrizes(campaign, request.getPrizes());

        return getPublicCampaignDetail(campaign.getSlug());
    }

    @Transactional
    public void deleteCampaign(UUID id) {
        GiveawayCampaignJpaEntity campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GiveawayCampaign", "id", id));
        campaignRepository.delete(campaign);
    }

    @Transactional(readOnly = true)
    public DrawPreviewResponse previewDraw(UUID campaignId, Integer winningNumber) {
        GiveawayCampaignJpaEntity campaign = campaignRepository.findByIdWithPrizes(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("GiveawayCampaign", "id", campaignId));

        List<GiveawayEntryJpaEntity> ranked = entryRepository.findRankedEntriesForDraw(campaignId, winningNumber);
        return GiveawayDrawHelper.computeDraw(campaign, campaign.getPrizes(), ranked, winningNumber);
    }

    @Transactional
    public DrawPreviewResponse executeDraw(UUID campaignId, DrawGiveawayRequest request) {
        GiveawayCampaignJpaEntity campaign = campaignRepository.findByIdWithPrizes(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("GiveawayCampaign", "id", campaignId));

        List<GiveawayEntryJpaEntity> ranked = entryRepository.findRankedEntriesForDraw(campaignId, request.getWinningNumber());
        List<GiveawayPrizeJpaEntity> slots = GiveawayDrawHelper.expandPrizeSlots(campaign.getPrizes());

        List<GiveawayEntryJpaEntity> winningEntries = new ArrayList<>();
        for (int i = 0; i < ranked.size(); i++) {
            GiveawayEntryJpaEntity entry = ranked.get(i);
            if (i < slots.size()) {
                entry.setIsWinner(true);
                entry.setPrize(slots.get(i));
                entry.setPrizeRank(i + 1);
                winningEntries.add(entry);
            } else {
                entry.setIsWinner(false);
                entry.setPrize(null);
                entry.setPrizeRank(null);
            }
        }
        entryRepository.saveAll(ranked);

        campaign.setStatus("DRAWN");
        campaign.setWinningNumber(request.getWinningNumber());
        campaign.setDrawDate(OffsetDateTime.now());
        campaign.setTotalWinnersCount(winningEntries.size());
        campaign.setUpdatedAt(OffsetDateTime.now());
        campaignRepository.save(campaign);

        if (Boolean.TRUE.equals(request.getSendNotificationEmails()) && !winningEntries.isEmpty()) {
            emailNotifier.enqueueWinnerNotifications(campaign, winningEntries, request.getWinningNumber());
        }

        return GiveawayDrawHelper.computeDraw(campaign, campaign.getPrizes(), ranked, request.getWinningNumber());
    }

    @Transactional(readOnly = true)
    public Page<GiveawayEntryDto> getCampaignEntries(UUID campaignId, Pageable pageable) {
        return entryRepository.findByCampaignIdOrderByCreatedAtDesc(campaignId, pageable)
                .map(GiveawayMapper::toEntryDto);
    }

    private void savePrizes(GiveawayCampaignJpaEntity campaign, List<GiveawayPrizeDto> prizeDtos) {
        if (prizeDtos == null || prizeDtos.isEmpty()) return;
        List<GiveawayPrizeJpaEntity> entities = new ArrayList<>();
        int order = 1;
        for (GiveawayPrizeDto dto : prizeDtos) {
            entities.add(GiveawayPrizeJpaEntity.builder()
                    .campaign(campaign)
                    .prizeTier(dto.getPrizeTier() != null ? dto.getPrizeTier() : "FIRST")
                    .prizeName(dto.getPrizeName().trim())
                    .quantity(dto.getQuantity() != null && dto.getQuantity() > 0 ? dto.getQuantity() : 1)
                    .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : order++)
                    .build());
        }
        prizeRepository.saveAll(entities);
    }
}
