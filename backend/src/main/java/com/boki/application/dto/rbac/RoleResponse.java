package com.boki.application.dto.rbac;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record RoleResponse(
        UUID id,
        String code,
        String name,
        String description,
        String color,
        boolean isSystem,
        Instant createdAt,
        List<String> permissionCodes,
        int userCount
) {}
