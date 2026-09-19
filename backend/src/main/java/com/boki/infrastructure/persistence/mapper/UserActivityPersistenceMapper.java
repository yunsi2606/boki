package com.boki.infrastructure.persistence.mapper;

import com.boki.domain.model.activity.ActivityEventCategory;
import com.boki.domain.model.activity.ActivityEventType;
import com.boki.domain.model.activity.UserActivity;
import com.boki.infrastructure.persistence.entity.UserActivityJpaEntity;

public final class UserActivityPersistenceMapper {

    private UserActivityPersistenceMapper() {
    }

    public static UserActivityJpaEntity toJpaEntity(UserActivity domain) {
        if (domain == null) return null;

        UserActivityJpaEntity entity = new UserActivityJpaEntity();
        entity.setId(domain.getId());
        entity.setSessionId(domain.getSessionId());
        entity.setUserId(domain.getUserId());
        entity.setUserEmail(domain.getUserEmail());
        entity.setUserRole(domain.getUserRole());
        entity.setEventType(domain.getEventType() != null ? domain.getEventType().name() : ActivityEventType.PAGE_VIEW.name());
        entity.setEventCategory(domain.getEventCategory() != null ? domain.getEventCategory().name() : ActivityEventCategory.NAVIGATION.name());
        entity.setPagePath(domain.getPagePath());
        entity.setPageTitle(domain.getPageTitle());
        entity.setReferrerUrl(domain.getReferrerUrl());
        entity.setTargetId(domain.getTargetId());
        entity.setTargetName(domain.getTargetName());
        entity.setMetadataJson(domain.getMetadataJson());
        entity.setIpAddress(domain.getIpAddress());
        entity.setUserAgent(domain.getUserAgent());
        entity.setDeviceType(domain.getDeviceType());
        entity.setBrowser(domain.getBrowser());
        entity.setOs(domain.getOs());
        entity.setDurationSeconds(domain.getDurationSeconds());
        entity.setCreatedAt(domain.getCreatedAt());
        return entity;
    }

    public static UserActivity toDomain(UserActivityJpaEntity entity) {
        if (entity == null) return null;

        return UserActivity.reconstitute(
                entity.getId(),
                entity.getSessionId(),
                entity.getUserId(),
                entity.getUserEmail(),
                entity.getUserRole(),
                ActivityEventType.fromString(entity.getEventType()),
                ActivityEventCategory.fromString(entity.getEventCategory()),
                entity.getPagePath(),
                entity.getPageTitle(),
                entity.getReferrerUrl(),
                entity.getTargetId(),
                entity.getTargetName(),
                entity.getMetadataJson(),
                entity.getIpAddress(),
                entity.getUserAgent(),
                entity.getDeviceType(),
                entity.getBrowser(),
                entity.getOs(),
                entity.getDurationSeconds() != null ? entity.getDurationSeconds() : 0,
                entity.getCreatedAt()
        );
    }
}
