package com.boki.application.service;

import com.boki.application.dto.schedule.ReleaseStoreLinkRequest;
import com.boki.infrastructure.persistence.entity.ReleaseScheduleJpaEntity;
import com.boki.infrastructure.persistence.entity.ReleaseStoreLinkJpaEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ReleaseStoreLinkService {

    public List<ReleaseStoreLinkJpaEntity> mapAndSetStoreLinks(
            ReleaseScheduleJpaEntity schedule,
            List<ReleaseStoreLinkRequest> requests
    ) {
        if (requests == null) {
            return schedule.getStoreLinks() != null ? schedule.getStoreLinks() : new ArrayList<>();
        }

        List<ReleaseStoreLinkJpaEntity> newLinks = new ArrayList<>();
        for (int i = 0; i < requests.size(); i++) {
            ReleaseStoreLinkRequest req = requests.get(i);
            if (req.getProductUrl() == null || req.getProductUrl().isBlank()) {
                continue;
            }

            ReleaseStoreLinkJpaEntity entity = ReleaseStoreLinkJpaEntity.builder()
                    .id(req.getId())
                    .scheduleId(schedule.getId())
                    .editionId(req.getEditionId())
                    .platform(normalizePlatform(req.getPlatform()))
                    .storeName(req.getStoreName() != null && !req.getStoreName().isBlank() ? req.getStoreName().trim() : null)
                    .productUrl(req.getProductUrl().trim())
                    .marketPrice(req.getMarketPrice())
                    .isPreorder(Boolean.TRUE.equals(req.getIsPreorder()))
                    .sortOrder(req.getSortOrder() != null ? req.getSortOrder() : i)
                    .build();

            newLinks.add(entity);
        }

        if (schedule.getStoreLinks() == null) {
            schedule.setStoreLinks(new ArrayList<>());
        } else {
            schedule.getStoreLinks().clear();
        }
        schedule.getStoreLinks().addAll(newLinks);
        return schedule.getStoreLinks();
    }

    private String normalizePlatform(String platform) {
        if (platform == null || platform.isBlank()) return "OTHER";
        String upper = platform.trim().toUpperCase();
        if (upper.contains("SHOPEE")) return "SHOPEE";
        if (upper.contains("TIKTOK")) return "TIKTOK_SHOP";
        if (upper.contains("TIKI")) return "TIKI";
        if (upper.contains("FAHASA")) return "FAHASA";
        if (upper.contains("BOKI")) return "BOKI_STORE";
        return upper;
    }
}
