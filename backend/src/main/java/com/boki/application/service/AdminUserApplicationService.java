package com.boki.application.service;

import com.boki.application.dto.user.*;
import com.boki.infrastructure.persistence.entity.OrderJpaEntity;
import com.boki.infrastructure.persistence.entity.RoleJpaEntity;
import com.boki.infrastructure.persistence.entity.UserActivityJpaEntity;
import com.boki.infrastructure.persistence.entity.UserJpaEntity;
import com.boki.infrastructure.persistence.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class AdminUserApplicationService {

    private final UserJpaRepository userRepository;
    private final RoleJpaRepository roleRepository;
    private final OrderJpaRepository orderRepository;
    private final UserActivityJpaRepository activityRepository;

    public AdminUserApplicationService(
            UserJpaRepository userRepository,
            RoleJpaRepository roleRepository,
            OrderJpaRepository orderRepository,
            UserActivityJpaRepository activityRepository
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.orderRepository = orderRepository;
        this.activityRepository = activityRepository;
    }

    public Page<AdminUserSummaryResponse> getUsers(
            String keyword, Boolean active, Boolean phoneVerified, String memberTier, int page, int size
    ) {
        org.springframework.data.jpa.domain.Specification<UserJpaEntity> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.isBlank()) {
                String term = "%" + keyword.trim().toLowerCase() + "%";
                jakarta.persistence.criteria.Predicate emailLike = cb.like(cb.lower(root.get("email")), term);
                jakarta.persistence.criteria.Predicate nameLike = cb.like(cb.lower(root.get("displayName")), term);
                jakarta.persistence.criteria.Predicate phoneLike = cb.like(cb.lower(cb.coalesce(root.get("phoneNumber"), "")), term);
                predicates.add(cb.or(emailLike, nameLike, phoneLike));
            }

            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }

            if (phoneVerified != null) {
                predicates.add(cb.equal(root.get("phoneVerified"), phoneVerified));
            }

            if (memberTier != null && !memberTier.isBlank() && !"ALL".equalsIgnoreCase(memberTier)) {
                predicates.add(cb.equal(cb.upper(root.get("memberTier")), memberTier.trim().toUpperCase()));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<UserJpaEntity> userPage = userRepository.findAll(spec, pageRequest);

        return userPage.map(this::toSummaryResponse);
    }

    public AdminUserStatsResponse getUserStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByActiveTrue();
        long blockedUsers = userRepository.countByActiveFalse();
        long phoneVerifiedUsers = userRepository.countByPhoneVerifiedTrue();

        Map<String, Long> tierCounts = new LinkedHashMap<>();
        tierCounts.put("STANDARD", 0L);
        tierCounts.put("SILVER", 0L);
        tierCounts.put("GOLD", 0L);
        tierCounts.put("DIAMOND", 0L);

        long vipCount = 0;
        List<UserJpaEntity> allUsers = userRepository.findAll();
        for (UserJpaEntity u : allUsers) {
            String tier = u.getMemberTier() != null ? u.getMemberTier().toUpperCase() : "STANDARD";
            tierCounts.put(tier, tierCounts.getOrDefault(tier, 0L) + 1L);
            if (isVipUser(u)) {
                vipCount++;
            }
        }

        return new AdminUserStatsResponse(totalUsers, activeUsers, blockedUsers, phoneVerifiedUsers, vipCount, tierCounts);
    }

    public AdminUserDetailResponse getUser360Detail(UUID userId) {
        UserJpaEntity user = userRepository.findByIdWithRolesAndPermissions(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng: " + userId));

        long totalOrders = orderRepository.countByBuyerId(userId);
        long completedOrders = orderRepository.countByBuyerIdAndStatus(userId, OrderJpaEntity.OrderStatusJpa.DELIVERED);
        long cancelledOrders = orderRepository.countByBuyerIdAndStatus(userId, OrderJpaEntity.OrderStatusJpa.CANCELLED);

        List<String> roleCodes = user.getDynamicRoles().stream().map(RoleJpaEntity::getCode).sorted().toList();
        Set<String> permCodes = new TreeSet<>();
        for (RoleJpaEntity r : user.getDynamicRoles()) {
            r.getPermissions().forEach(p -> permCodes.add(p.getCode()));
        }

        List<UserActivityJpaEntity> recentActs = activityRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 8));
        List<AdminUserDetailResponse.UserRecentActivityDto> activityDtos = recentActs.stream()
                .map(a -> new AdminUserDetailResponse.UserRecentActivityDto(
                        a.getEventType(),
                        a.getTargetName() != null ? a.getTargetName() : a.getEventType(),
                        a.getIpAddress(),
                        a.getCreatedAt()
                ))
                .toList();

        List<String> smartTags = computeSmartTags(user, totalOrders, cancelledOrders);

        return new AdminUserDetailResponse(
                user.getId(), user.getEmail(),
                user.getDisplayName() != null ? user.getDisplayName() : user.getEmail(),
                user.getPhoneNumber(),
                user.isPhoneVerified(), user.isEmailVerified(), user.getAvatarUrl(),
                user.getRole() != null ? user.getRole().name() : "BUYER",
                user.getMemberTier() != null ? user.getMemberTier() : "STANDARD",
                user.getTotalSpent() != null ? user.getTotalSpent() : BigDecimal.ZERO,
                user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 0,
                user.isActive(), user.getCreatedAt(), user.getUpdatedAt(),
                user.getShippingFullName(), user.getShippingPhone(), user.getShippingProvince(),
                user.getShippingDistrict(), user.getShippingWard(), user.getShippingStreetAddress(),
                user.getShippingDeliveryNote(), roleCodes, new ArrayList<>(permCodes),
                smartTags, totalOrders, completedOrders, cancelledOrders, activityDtos
        );
    }

    @Transactional
    public void updateUserStatus(UUID userId, boolean active, String reason, UUID currentAdminId) {
        if (userId.equals(currentAdminId) && !active) {
            throw new IllegalArgumentException("Bạn không thể tự khóa tài khoản của chính mình!");
        }

        UserJpaEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng: " + userId));

        user.setActive(active);
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
    }

    @Transactional
    public void updateUserRoles(UUID userId, List<String> roleCodes, String memberTier, UUID currentAdminId) {
        UserJpaEntity user = userRepository.findByIdWithRolesAndPermissions(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng: " + userId));

        user.getDynamicRoles().clear();
        boolean hasAdmin = false;
        boolean hasSeller = false;

        for (String code : roleCodes) {
            Optional<RoleJpaEntity> roleOpt = roleRepository.findByCodeWithPermissions(code.trim().toUpperCase());
            if (roleOpt.isPresent()) {
                RoleJpaEntity role = roleOpt.get();
                user.getDynamicRoles().add(role);
                if (code.equalsIgnoreCase("SUPER_ADMIN") || code.equalsIgnoreCase("ADMIN")) hasAdmin = true;
                if (code.equalsIgnoreCase("STORE_MANAGER") || code.equalsIgnoreCase("SELLER")) hasSeller = true;
            }
        }

        // Tương thích ngược: Đồng bộ users.role
        if (hasAdmin) {
            user.setRole(UserJpaEntity.UserRoleJpa.ADMIN);
        } else if (hasSeller) {
            user.setRole(UserJpaEntity.UserRoleJpa.SELLER);
        } else {
            user.setRole(UserJpaEntity.UserRoleJpa.BUYER);
        }

        if (memberTier != null && !memberTier.isBlank()) {
            user.setMemberTier(memberTier.toUpperCase());
        }
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
    }

    private AdminUserSummaryResponse toSummaryResponse(UserJpaEntity u) {
        List<String> roleCodes = u.getDynamicRoles() != null
                ? u.getDynamicRoles().stream().map(RoleJpaEntity::getCode).sorted().toList()
                : Collections.emptyList();
        List<String> tags = computeSmartTags(u, 0, 0);

        return new AdminUserSummaryResponse(
                u.getId(),
                u.getEmail(),
                u.getDisplayName() != null ? u.getDisplayName() : u.getEmail(),
                u.getPhoneNumber(),
                u.isPhoneVerified(),
                u.isEmailVerified(),
                u.getAvatarUrl(),
                u.getRole() != null ? u.getRole().name() : "BUYER",
                u.getMemberTier() != null ? u.getMemberTier() : "STANDARD",
                u.getTotalSpent() != null ? u.getTotalSpent() : BigDecimal.ZERO,
                u.getLoyaltyPoints() != null ? u.getLoyaltyPoints() : 0,
                u.isActive(),
                u.getCreatedAt(),
                roleCodes,
                tags
        );
    }

    private boolean isVipUser(UserJpaEntity u) {
        BigDecimal spent = u.getTotalSpent() != null ? u.getTotalSpent() : BigDecimal.ZERO;
        String tier = u.getMemberTier() != null ? u.getMemberTier() : "STANDARD";
        return spent.compareTo(BigDecimal.valueOf(2000000)) >= 0 || "GOLD".equalsIgnoreCase(tier) || "DIAMOND".equalsIgnoreCase(tier);
    }

    private List<String> computeSmartTags(UserJpaEntity u, long totalOrders, long cancelledOrders) {
        List<String> tags = new ArrayList<>();
        if (isVipUser(u)) {
            tags.add("VIP");
        }
        if (!u.isPhoneVerified()) {
            tags.add("UNVERIFIED_PHONE");
        }
        if (u.getCreatedAt() != null && u.getCreatedAt().isAfter(Instant.now().minus(7, ChronoUnit.DAYS))) {
            tags.add("NEW_USER");
        }
        if (totalOrders >= 3 && cancelledOrders >= 2 && ((double) cancelledOrders / totalOrders) >= 0.4) {
            tags.add("RISK_CANCEL");
        }
        return tags;
    }
}
