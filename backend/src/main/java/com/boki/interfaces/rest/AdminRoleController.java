package com.boki.interfaces.rest;

import com.boki.application.dto.rbac.*;
import com.boki.application.service.DynamicRbacApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/roles")
@PreAuthorize("@perm.can('ROLE_MANAGE')")
public class AdminRoleController {

    private final DynamicRbacApplicationService rbacService;

    public AdminRoleController(DynamicRbacApplicationService rbacService) {
        this.rbacService = rbacService;
    }

    @GetMapping
    public ResponseEntity<List<RoleResponse>> getAllRoles() {
        return ResponseEntity.ok(rbacService.getAllRoles());
    }

    @GetMapping("/permissions")
    public ResponseEntity<List<PermissionGroupResponse>> getAllPermissions() {
        return ResponseEntity.ok(rbacService.getAllPermissionsGrouped());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoleResponse> getRoleById(@PathVariable UUID id) {
        return ResponseEntity.ok(rbacService.getRoleById(id));
    }

    @PostMapping
    public ResponseEntity<RoleResponse> createRole(@Valid @RequestBody SaveRoleRequest request) {
        RoleResponse created = rbacService.createRole(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoleResponse> updateRole(
            @PathVariable UUID id,
            @Valid @RequestBody SaveRoleRequest request
    ) {
        RoleResponse updated = rbacService.updateRole(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteRole(@PathVariable UUID id) {
        rbacService.deleteRole(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa vai trò thành công"));
    }
}
