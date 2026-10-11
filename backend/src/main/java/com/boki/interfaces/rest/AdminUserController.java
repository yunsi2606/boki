package com.boki.interfaces.rest;

import com.boki.application.dto.user.*;
import com.boki.application.service.AdminUserApplicationService;
import com.boki.infrastructure.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("@perm.can('USER_VIEW')")
public class AdminUserController {

    private final AdminUserApplicationService adminUserService;

    public AdminUserController(AdminUserApplicationService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public ResponseEntity<Page<AdminUserSummaryResponse>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Boolean phoneVerified,
            @RequestParam(required = false) String memberTier,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Page<AdminUserSummaryResponse> users = adminUserService.getUsers(keyword, active, phoneVerified, memberTier, page, size);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminUserStatsResponse> getUserStats() {
        return ResponseEntity.ok(adminUserService.getUserStats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminUserDetailResponse> getUserDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(adminUserService.getUser360Detail(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("@perm.can('USER_MANAGE')")
    public ResponseEntity<Map<String, String>> updateUserStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserStatusRequest request,
            @AuthenticationPrincipal AuthenticatedUser currentAdmin
    ) {
        UUID adminId = currentAdmin != null ? currentAdmin.userId() : null;
        adminUserService.updateUserStatus(id, request.active(), request.reason(), adminId);
        return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái người dùng thành công"));
    }

    @PatchMapping("/{id}/roles")
    @PreAuthorize("@perm.can('ROLE_MANAGE')")
    public ResponseEntity<Map<String, String>> updateUserRoles(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRolesRequest request,
            @AuthenticationPrincipal AuthenticatedUser currentAdmin
    ) {
        UUID adminId = currentAdmin != null ? currentAdmin.userId() : null;
        adminUserService.updateUserRoles(id, request.roleCodes(), request.memberTier(), adminId);
        return ResponseEntity.ok(Map.of("message", "Cập nhật vai trò & thứ hạng thành công"));
    }
}
