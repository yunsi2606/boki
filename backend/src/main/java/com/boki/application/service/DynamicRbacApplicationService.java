package com.boki.application.service;

import com.boki.application.dto.rbac.*;
import com.boki.infrastructure.persistence.entity.PermissionJpaEntity;
import com.boki.infrastructure.persistence.entity.RoleJpaEntity;
import com.boki.infrastructure.persistence.entity.UserJpaEntity;
import com.boki.infrastructure.persistence.repository.PermissionJpaRepository;
import com.boki.infrastructure.persistence.repository.RoleJpaRepository;
import com.boki.infrastructure.persistence.repository.UserJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DynamicRbacApplicationService {

    private final RoleJpaRepository roleRepository;
    private final PermissionJpaRepository permissionRepository;
    private final UserJpaRepository userRepository;

    public DynamicRbacApplicationService(
            RoleJpaRepository roleRepository,
            PermissionJpaRepository permissionRepository,
            UserJpaRepository userRepository
    ) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
    }

    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAllWithPermissions().stream()
                .map(this::mapToRoleResponse)
                .toList();
    }

    public RoleResponse getRoleById(UUID id) {
        RoleJpaEntity role = roleRepository.findByIdWithPermissions(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy vai trò với ID: " + id));
        return mapToRoleResponse(role);
    }

    public List<PermissionGroupResponse> getAllPermissionsGrouped() {
        List<PermissionJpaEntity> permissions = permissionRepository.findAllByOrderByModuleAscCodeAsc();
        Map<String, List<PermissionResponse>> byModule = new LinkedHashMap<>();

        for (PermissionJpaEntity p : permissions) {
            byModule.computeIfAbsent(p.getModule(), k -> new ArrayList<>())
                    .add(new PermissionResponse(p.getId(), p.getCode(), p.getName(), p.getModule(), p.getDescription()));
        }

        return byModule.entrySet().stream()
                .map(e -> new PermissionGroupResponse(e.getKey(), getModuleNameVi(e.getKey()), e.getValue()))
                .toList();
    }

    @Transactional
    public RoleResponse createRole(SaveRoleRequest request) {
        String code = request.code().trim().toUpperCase();
        if (roleRepository.existsByCode(code)) {
            throw new IllegalArgumentException("Mã vai trò đã tồn tại: " + code);
        }

        RoleJpaEntity entity = new RoleJpaEntity(
                UUID.randomUUID(),
                code,
                request.name().trim(),
                request.description() != null ? request.description().trim() : "",
                request.color() != null && !request.color().isBlank() ? request.color() : "#4F46E5",
                false
        );

        assignPermissions(entity, request.permissionCodes());
        RoleJpaEntity saved = roleRepository.save(entity);
        return mapToRoleResponse(saved);
    }

    @Transactional
    public RoleResponse updateRole(UUID id, SaveRoleRequest request) {
        RoleJpaEntity entity = roleRepository.findByIdWithPermissions(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy vai trò: " + id));

        entity.setName(request.name().trim());
        if (request.description() != null) {
            entity.setDescription(request.description().trim());
        }
        if (request.color() != null && !request.color().isBlank()) {
            entity.setColor(request.color());
        }
        entity.setUpdatedAt(Instant.now());

        // Cho phép chỉnh sửa permissions
        assignPermissions(entity, request.permissionCodes());
        RoleJpaEntity saved = roleRepository.save(entity);
        return mapToRoleResponse(saved);
    }

    @Transactional
    public void deleteRole(UUID id) {
        RoleJpaEntity entity = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy vai trò: " + id));

        if (entity.isSystem()) {
            throw new IllegalStateException("Không được phép xóa vai trò hệ thống mặc định (" + entity.getName() + ")");
        }

        roleRepository.delete(entity);
    }

    public Set<String> getUserPermissionCodes(UUID userId) {
        Optional<UserJpaEntity> userOpt = userRepository.findByIdWithRolesAndPermissions(userId);
        if (userOpt.isEmpty()) {
            return Collections.emptySet();
        }

        UserJpaEntity user = userOpt.get();
        if (user.getRole() == UserJpaEntity.UserRoleJpa.ADMIN) {
            // ADMIN luôn có tất cả permissions
            return permissionRepository.findAll().stream()
                    .map(PermissionJpaEntity::getCode)
                    .collect(Collectors.toSet());
        }

        Set<String> codes = new HashSet<>();
        for (RoleJpaEntity r : user.getDynamicRoles()) {
            for (PermissionJpaEntity p : r.getPermissions()) {
                codes.add(p.getCode());
            }
        }
        return codes;
    }

    private void assignPermissions(RoleJpaEntity entity, List<String> codes) {
        entity.getPermissions().clear();
        if (codes != null && !codes.isEmpty()) {
            for (String code : codes) {
                permissionRepository.findByCode(code.trim().toUpperCase())
                        .ifPresent(entity.getPermissions()::add);
            }
        }
    }

    private RoleResponse mapToRoleResponse(RoleJpaEntity r) {
        List<String> permCodes = r.getPermissions().stream()
                .map(PermissionJpaEntity::getCode)
                .sorted()
                .toList();

        return new RoleResponse(
                r.getId(),
                r.getCode(),
                r.getName(),
                r.getDescription(),
                r.getColor(),
                r.isSystem(),
                r.getCreatedAt(),
                permCodes,
                0
        );
    }

    private String getModuleNameVi(String module) {
        return switch (module.toUpperCase()) {
            case "BOOKS" -> "Quản Lý Sách & Kho";
            case "ORDERS" -> "Xử Lý Đơn Hàng & Vận Chuyển";
            case "SCHEDULE" -> "Lịch Phát Hành NXB";
            case "BLOGS" -> "Tin Tức & Đọc Thử Sách";
            case "PROMOTIONS" -> "Khuyến Mãi & Flash Sale";
            case "USERS" -> "Người Dùng & Phân Quyền";
            case "SYSTEM" -> "Hệ Thống & Lưu Trữ R2";
            default -> module;
        };
    }
}
