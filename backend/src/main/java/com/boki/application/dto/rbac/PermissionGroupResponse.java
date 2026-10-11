package com.boki.application.dto.rbac;

import java.util.List;

public record PermissionGroupResponse(
        String module,
        String moduleName,
        List<PermissionResponse> permissions
) {}
