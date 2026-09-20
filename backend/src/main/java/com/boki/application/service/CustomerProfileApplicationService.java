package com.boki.application.service;

import com.boki.application.dto.request.UpdateProfileDetailsRequest;
import com.boki.application.dto.request.UpdateShippingAddressRequest;
import com.boki.application.dto.response.CustomerProfileSummaryResponse;
import com.boki.application.dto.response.MemberRankingResponse;
import com.boki.application.dto.response.OrderResponse;
import com.boki.application.dto.response.SpendingStatsResponse;
import com.boki.application.dto.response.UserResponse;
import com.boki.application.exception.ResourceNotFoundException;
import com.boki.application.mapper.OrderDtoMapper;
import com.boki.application.mapper.UserDtoMapper;
import com.boki.domain.model.order.Order;
import com.boki.domain.model.order.OrderStatus;
import com.boki.domain.model.user.PhoneNumber;
import com.boki.domain.model.user.User;
import com.boki.domain.model.user.UserId;
import com.boki.domain.port.out.OrderRepository;
import com.boki.domain.port.out.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Service orchestrating customer profile overview, address management,
 * order spending statistics, and loyalty ranking.
 */
@Service
public class CustomerProfileApplicationService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final MemberTierService memberTierService;
    private final OrderDtoMapper orderDtoMapper;

    public CustomerProfileApplicationService(
            UserRepository userRepository,
            OrderRepository orderRepository,
            MemberTierService memberTierService,
            OrderDtoMapper orderDtoMapper
    ) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.memberTierService = memberTierService;
        this.orderDtoMapper = orderDtoMapper;
    }

    /**
     * Aggregates complete profile summary: user info, ranking breakdown, spending KPIs, and recent orders.
     */
    @Transactional
    public CustomerProfileSummaryResponse getProfileSummary(UUID userId) {
        User user = userRepository.findById(UserId.of(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // 1. Ranking breakdown
        MemberRankingResponse ranking = memberTierService.getMemberRanking(userId);

        // 2. Orders & Spending statistics
        List<Order> orders = orderRepository.findByBuyerId(UserId.of(userId));

        long totalOrders = orders.size();
        long completedOrders = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .count();
        long activeOrders = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.PENDING ||
                             o.getStatus() == OrderStatus.CONFIRMED ||
                             o.getStatus() == OrderStatus.SHIPPED ||
                             o.getStatus() == OrderStatus.DELIVERED)
                .count();
        long cancelledOrders = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.CANCELLED ||
                             o.getStatus() == OrderStatus.RETURNED)
                .count();

        BigDecimal totalDiscountSaved = orders.stream()
                .map(o -> o.getMemberDiscountAmount() != null ? o.getMemberDiscountAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        SpendingStatsResponse stats = new SpendingStatsResponse(
                user.getTotalSpent(),
                totalOrders,
                completedOrders,
                activeOrders,
                cancelledOrders,
                user.getLoyaltyPoints(),
                totalDiscountSaved
        );

        // 3. Recent 5 orders
        List<OrderResponse> recentOrders = orders.stream()
                .limit(5)
                .map(orderDtoMapper::toResponse)
                .toList();

        UserResponse userResponse = UserDtoMapper.toResponse(user);

        return new CustomerProfileSummaryResponse(userResponse, ranking, stats, recentOrders);
    }

    /**
     * Updates default shipping address in customer profile.
     */
    @Transactional
    public UserResponse updateShippingAddress(UUID userId, UpdateShippingAddressRequest request) {
        User user = userRepository.findById(UserId.of(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.updateShippingAddress(
                request.fullName(),
                request.phoneNumber(),
                request.province(),
                request.provinceCode(),
                request.district(),
                request.districtCode(),
                request.ward(),
                request.wardCode(),
                request.streetAddress(),
                request.note()
        );

        User saved = userRepository.save(user);
        return UserDtoMapper.toResponse(saved);
    }

    /**
     * Updates profile basic details (display name, avatar, phone).
     */
    @Transactional
    public UserResponse updateProfileDetails(UUID userId, UpdateProfileDetailsRequest request) {
        User user = userRepository.findById(UserId.of(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        PhoneNumber phone = (request.phoneNumber() != null && !request.phoneNumber().isBlank())
                ? PhoneNumber.of(request.phoneNumber())
                : null;

        user.updateProfileDetails(request.displayName(), request.avatarUrl(), phone);

        User saved = userRepository.save(user);
        return UserDtoMapper.toResponse(saved);
    }
}
