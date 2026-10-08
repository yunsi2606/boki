package com.boki.interfaces.rest;

import com.boki.application.dto.response.AnalyticsDto;
import com.boki.infrastructure.persistence.entity.OrderJpaEntity;
import com.boki.infrastructure.persistence.repository.BookJpaRepository;
import com.boki.infrastructure.persistence.repository.OrderItemJpaRepository;
import com.boki.infrastructure.persistence.repository.OrderJpaRepository;
import com.boki.infrastructure.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminDashboardController {

    private final BookJpaRepository bookRepository;
    private final OrderJpaRepository orderRepository;
    private final OrderItemJpaRepository orderItemRepository;
    private final UserJpaRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAdminDashboardStats() {
        long totalBooks = bookRepository.count();
        long totalOrders = orderRepository.count();
        long totalUsers = userRepository.count();
        BigDecimal totalRevenue = orderRepository.sumTotalRevenue();
        long lowStockCount = bookRepository.countByStockQuantityLessThanEqual(10);
        long pendingOrdersCount = orderRepository.countByStatus(OrderJpaEntity.OrderStatusJpa.PENDING);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBooks", totalBooks);
        stats.put("totalOrders", totalOrders);
        stats.put("totalUsers", totalUsers);
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        stats.put("lowStockCount", lowStockCount);
        stats.put("pendingOrdersCount", pendingOrdersCount);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/analytics/revenue-trends")
    public ResponseEntity<AnalyticsDto.RevenueTrendsResponse> getRevenueTrends(
            @RequestParam(defaultValue = "7") int days
    ) {
        int safeDays = Math.min(Math.max(days, 1), 90);
        Instant since = Instant.now().minus(safeDays, ChronoUnit.DAYS);
        List<Object[]> rawTrends = orderRepository.getDailyRevenueTrends(since);

        Map<String, AnalyticsDto.DailyRevenuePoint> dateMap = new HashMap<>();
        BigDecimal totalRevenuePeriod = BigDecimal.ZERO;
        long totalOrdersPeriod = 0;

        for (Object[] row : rawTrends) {
            String dateStr = String.valueOf(row[0]);
            BigDecimal rev = row[1] != null ? new BigDecimal(String.valueOf(row[1])) : BigDecimal.ZERO;
            long orders = row[2] != null ? ((Number) row[2]).longValue() : 0L;
            dateMap.put(dateStr, new AnalyticsDto.DailyRevenuePoint(dateStr, rev, orders));
            totalRevenuePeriod = totalRevenuePeriod.add(rev);
            totalOrdersPeriod += orders;
        }

        List<AnalyticsDto.DailyRevenuePoint> timeline = new ArrayList<>();
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        for (int i = safeDays - 1; i >= 0; i--) {
            String d = today.minusDays(i).toString();
            if (dateMap.containsKey(d)) {
                timeline.add(dateMap.get(d));
            } else {
                timeline.add(new AnalyticsDto.DailyRevenuePoint(d, BigDecimal.ZERO, 0L));
            }
        }

        return ResponseEntity.ok(new AnalyticsDto.RevenueTrendsResponse(
                safeDays,
                totalRevenuePeriod,
                totalOrdersPeriod,
                timeline
        ));
    }

    @GetMapping("/analytics/categories")
    public ResponseEntity<List<AnalyticsDto.CategoryRevenueShare>> getCategoryDistribution() {
        List<Object[]> rows = orderItemRepository.findCategoryRevenueDistribution();
        BigDecimal grandTotal = BigDecimal.ZERO;
        for (Object[] r : rows) {
            if (r[1] != null) {
                grandTotal = grandTotal.add(new BigDecimal(String.valueOf(r[1])));
            }
        }

        List<AnalyticsDto.CategoryRevenueShare> result = new ArrayList<>();
        for (Object[] r : rows) {
            String catName = r[0] != null ? String.valueOf(r[0]) : "Chung";
            BigDecimal rev = r[1] != null ? new BigDecimal(String.valueOf(r[1])) : BigDecimal.ZERO;
            long sold = r[2] != null ? ((Number) r[2]).longValue() : 0L;
            double pct = 0.0;
            if (grandTotal.compareTo(BigDecimal.ZERO) > 0) {
                pct = rev.multiply(BigDecimal.valueOf(100))
                        .divide(grandTotal, 1, RoundingMode.HALF_UP)
                        .doubleValue();
            }
            result.add(new AnalyticsDto.CategoryRevenueShare(catName, rev, sold, pct));
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/analytics/top-books")
    public ResponseEntity<List<AnalyticsDto.TopSellingBook>> getTopSellingBooks(
            @RequestParam(defaultValue = "5") int limit
    ) {
        int safeLimit = Math.min(Math.max(limit, 1), 20);
        List<Object[]> rows = orderItemRepository.findTopSellingBooks(safeLimit);
        List<AnalyticsDto.TopSellingBook> result = new ArrayList<>();

        for (Object[] r : rows) {
            UUID bookId = r[0] != null ? (UUID) r[0] : null;
            String title = r[1] != null ? String.valueOf(r[1]) : "";
            String author = r[2] != null ? String.valueOf(r[2]) : "";
            String coverUrl = r[3] != null ? String.valueOf(r[3]) : null;
            long unitsSold = r[4] != null ? ((Number) r[4]).longValue() : 0L;
            BigDecimal rev = r[5] != null ? new BigDecimal(String.valueOf(r[5])) : BigDecimal.ZERO;

            result.add(new AnalyticsDto.TopSellingBook(bookId, title, author, coverUrl, unitsSold, rev));
        }

        return ResponseEntity.ok(result);
    }
}
