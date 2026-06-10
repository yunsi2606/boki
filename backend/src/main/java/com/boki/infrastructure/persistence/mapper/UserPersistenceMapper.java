package com.boki.infrastructure.persistence.mapper;

import com.boki.domain.model.user.*;
import com.boki.infrastructure.persistence.entity.UserJpaEntity;
import com.boki.infrastructure.persistence.entity.UserJpaEntity.UserRoleJpa;

/**
 * Maps between domain User and JPA UserJpaEntity.
 * Infrastructure concern — domain stays clean.
 */
public final class UserPersistenceMapper {

    private UserPersistenceMapper() {
    }

    public static UserJpaEntity toJpaEntity(User user) {
        UserJpaEntity entity = new UserJpaEntity();
        entity.setId(user.getId().value());
        entity.setEmail(user.getEmail().value());
        entity.setPasswordHash(user.getPasswordHash());
        entity.setDisplayName(user.getDisplayName());
        entity.setPhoneNumber(user.getPhoneNumber() != null ? user.getPhoneNumber().value() : null);
        entity.setPhoneVerified(user.getPhoneVerified());
        entity.setAvatarUrl(user.getAvatarUrl());
        entity.setRole(UserRoleJpa.valueOf(user.getRole().name()));
        entity.setEmailVerified(user.isEmailVerified());
        entity.setActive(user.isActive());
        entity.setCreatedAt(user.getCreatedAt());
        entity.setUpdatedAt(user.getUpdatedAt());
        entity.setCreatedBy(user.getCreatedBy());
        return entity;
    }

    public static User toDomainModel(UserJpaEntity entity) {
        return User.reconstitute(
                UserId.of(entity.getId()),
                Email.of(entity.getEmail()),
                entity.getPasswordHash(),
                entity.getDisplayName(),
                entity.getPhoneNumber() != null ? PhoneNumber.of(entity.getPhoneNumber()) : null,
                entity.isPhoneVerified(),
                entity.getAvatarUrl(),
                UserRole.valueOf(entity.getRole().name()),
                entity.isEmailVerified(),
                entity.isActive(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getCreatedBy()
        );
    }
}
