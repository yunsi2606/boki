package com.boki.application.dto.rbac;

import java.util.UUID;

public record PermissionResponse(
        UUID id,
        String code,
        String name,
        String module,
        String description
) {}
