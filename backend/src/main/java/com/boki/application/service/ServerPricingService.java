package com.boki.application.service;

import com.boki.application.dto.request.OrderItemRequest;
import com.boki.application.exception.BusinessRuleException;
import com.boki.domain.model.book.Book;
import com.boki.domain.model.book.BookId;
import com.boki.domain.model.user.MemberTier;
import com.boki.domain.port.out.BookRepository;
import com.boki.infrastructure.persistence.entity.VoucherJpaEntity;
import com.boki.infrastructure.persistence.repository.VoucherJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Service for server-authoritative pricing verification.
 * Strictly prevents client-side price tampering by computing item prices from the database,
 * evaluating Member Tier discounts, validating voucher constraints, and finalizing the bill.
 */
@Service
public class ServerPricingService {

    private final BookRepository bookRepository;
    private final VoucherJpaRepository voucherJpaRepository;
    private final MemberTierService memberTierService;

    public ServerPricingService(
            BookRepository bookRepository,
            VoucherJpaRepository voucherJpaRepository,
            MemberTierService memberTierService
    ) {
        this.bookRepository = bookRepository;
        this.voucherJpaRepository = voucherJpaRepository;
        this.memberTierService = memberTierService;
    }

    public record ServerPricingResult(
            BigDecimal subtotal,
            MemberTier memberTier,
            int memberDiscountPercent,
            BigDecimal memberDiscountAmount,
            String voucherCode,
            BigDecimal voucherDiscountAmount,
            BigDecimal shippingFee,
            BigDecimal finalTotal,
            String pricingMessage
    ) {}

    /**
     * Verifies pricing on the server for a cart of items, member tier, and optional voucher code.
     */
    @Transactional(readOnly = true)
    public ServerPricingResult calculatePricing(
            List<OrderItemRequest> items,
            UUID buyerUserId,
            String voucherCode,
            BigDecimal shippingFee
    ) {
        if (items == null || items.isEmpty()) {
            throw new BusinessRuleException("Đơn hàng phải chứa ít nhất một sản phẩm.");
        }

        BigDecimal safeShippingFee = shippingFee != null ? shippingFee : BigDecimal.ZERO;

        // 1. Calculate subtotal strictly from current Database prices (Server Authoritative)
        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderItemRequest item : items) {
            Book book = bookRepository.findById(BookId.of(item.bookId()))
                    .orElseThrow(() -> new BusinessRuleException("Sách với mã '" + item.bookId() + "' không tồn tại trong hệ thống."));
            
            BigDecimal itemTotal = book.getPrice().amount().multiply(BigDecimal.valueOf(item.quantity()));
            subtotal = subtotal.add(itemTotal);
        }

        // 2. Resolve Member Tier and compute tier discount
        MemberTier tier = memberTierService.getBuyerTier(buyerUserId);
        MemberTierService.TierDiscountResult tierDiscountResult = memberTierService.calculateTierDiscount(tier, subtotal);
        BigDecimal memberDiscount = tierDiscountResult.discountAmount();

        // 3. Validate Voucher & compute voucher discount
        BigDecimal voucherDiscount = BigDecimal.ZERO;
        String validVoucherCode = null;

        if (voucherCode != null && !voucherCode.trim().isBlank()) {
            validVoucherCode = voucherCode.trim().toUpperCase();
            voucherDiscount = validateAndCalculateVoucherDiscount(validVoucherCode, subtotal, safeShippingFee, tier);
        }

        // 4. Calculate Final Total (minimum 0 VND)
        BigDecimal payableAfterDiscounts = subtotal.subtract(memberDiscount).subtract(voucherDiscount);
        if (payableAfterDiscounts.compareTo(BigDecimal.ZERO) < 0) {
            payableAfterDiscounts = BigDecimal.ZERO;
        }

        BigDecimal finalTotal = payableAfterDiscounts.add(safeShippingFee);

        return new ServerPricingResult(
                subtotal,
                tier,
                tierDiscountResult.discountPercent(),
                memberDiscount,
                validVoucherCode,
                voucherDiscount,
                safeShippingFee,
                finalTotal,
                buildPricingSummary(tier, memberDiscount, validVoucherCode, voucherDiscount)
        );
    }

    /**
     * Validates voucher constraints: active status, dates, usage limit, min order amount, and user scope.
     */
    public BigDecimal validateAndCalculateVoucherDiscount(
            String voucherCode,
            BigDecimal subtotal,
            BigDecimal shippingFee,
            MemberTier tier
    ) {
        VoucherJpaEntity voucher = voucherJpaRepository.findByCode(voucherCode)
                .orElseThrow(() -> new BusinessRuleException("Mã giảm giá '" + voucherCode + "' không tồn tại."));

        if (!Boolean.TRUE.equals(voucher.getIsActive())) {
            throw new BusinessRuleException("Mã giảm giá '" + voucherCode + "' đã tạm khóa hoặc ngừng hoạt động.");
        }

        OffsetDateTime now = OffsetDateTime.now();
        if (voucher.getStartDate() != null && now.isBefore(voucher.getStartDate())) {
            throw new BusinessRuleException("Mã giảm giá '" + voucherCode + "' chưa đến thời gian áp dụng.");
        }
        if (voucher.getEndDate() != null && now.isAfter(voucher.getEndDate())) {
            throw new BusinessRuleException("Mã giảm giá '" + voucherCode + "' đã hết hạn sử dụng.");
        }

        if (voucher.getUsageLimit() != null && voucher.getUsedCount() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new BusinessRuleException("Mã giảm giá '" + voucherCode + "' đã hết lượt sử dụng.");
        }

        DecimalFormat df = new DecimalFormat("#,###");
        if (voucher.getMinOrderAmount() != null && subtotal.compareTo(voucher.getMinOrderAmount()) < 0) {
            throw new BusinessRuleException("Đơn hàng phải có giá trị tối thiểu " + df.format(voucher.getMinOrderAmount()) + "đ để áp dụng mã '" + voucherCode + "'.");
        }

        if ("VIP_USER".equalsIgnoreCase(voucher.getUserScope()) && (tier == null || tier == MemberTier.STANDARD)) {
            throw new BusinessRuleException("Mã giảm giá '" + voucherCode + "' chỉ áp dụng cho thành viên VIP (Bạc, Vàng, Bạch Kim).");
        }

        // Calculate discount based on type
        String discountType = voucher.getDiscountType() != null ? voucher.getDiscountType() : "FIXED_AMOUNT";
        BigDecimal discount;

        if ("FREE_SHIPPING".equalsIgnoreCase(discountType)) {
            BigDecimal maxShipDiscount = voucher.getMaxDiscountAmount() != null ? voucher.getMaxDiscountAmount() : new BigDecimal("25000");
            discount = shippingFee.min(maxShipDiscount);
        } else if ("PERCENTAGE".equalsIgnoreCase(discountType)) {
            BigDecimal rate = voucher.getDiscountAmount().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
            discount = subtotal.multiply(rate).setScale(0, RoundingMode.HALF_UP);
            if (voucher.getMaxDiscountAmount() != null) {
                discount = discount.min(voucher.getMaxDiscountAmount());
            }
        } else {
            // FIXED_AMOUNT
            discount = voucher.getDiscountAmount().min(subtotal);
        }

        return discount;
    }

    /**
     * Increments the voucher used count when an order is officially placed.
     */
    @Transactional
    public void recordVoucherUsage(String voucherCode) {
        if (voucherCode == null || voucherCode.isBlank()) {
            return;
        }
        voucherJpaRepository.findByCode(voucherCode.trim().toUpperCase()).ifPresent(v -> {
            int current = v.getUsedCount() != null ? v.getUsedCount() : 0;
            v.setUsedCount(current + 1);
            voucherJpaRepository.save(v);
        });
    }

    private String buildPricingSummary(MemberTier tier, BigDecimal memberDiscount, String voucherCode, BigDecimal voucherDiscount) {
        StringBuilder sb = new StringBuilder();
        if (memberDiscount.compareTo(BigDecimal.ZERO) > 0) {
            sb.append("Ưu đãi ").append(tier.getDisplayName()).append(" (-").append(tier.getDiscountPercent()).append("%). ");
        }
        if (voucherDiscount.compareTo(BigDecimal.ZERO) > 0) {
            sb.append("Áp dụng mã voucher ").append(voucherCode).append(". ");
        }
        return sb.toString().trim();
    }
}
