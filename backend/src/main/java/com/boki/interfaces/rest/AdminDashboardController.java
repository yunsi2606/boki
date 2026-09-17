package com.boki.interfaces.rest;

import com.boki.infrastructure.persistence.repository.BookJpaRepository;
import com.boki.infrastructure.persistence.repository.OrderJpaRepository;
import com.boki.infrastructure.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminDashboardController {

    private final BookJpaRepository bookRepository;
    private final OrderJpaRepository orderRepository;
    private final UserJpaRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAdminDashboardStats() {
        long totalBooks = bookRepository.count();
        long totalOrders = orderRepository.count();
        long totalUsers = userRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBooks", totalBooks);
        stats.put("totalOrders", totalOrders);
        stats.put("totalUsers", totalUsers);
        stats.put("totalRevenue", 15480000); // Sample revenue
        stats.put("lowStockCount", 3);
        stats.put("pendingOrdersCount", 5);

        return ResponseEntity.ok(stats);
    }
}
