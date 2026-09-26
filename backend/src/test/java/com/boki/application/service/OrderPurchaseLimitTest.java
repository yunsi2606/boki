package com.boki.application.service;

import com.boki.application.dto.request.CreateOrderRequest;
import com.boki.application.dto.request.OrderItemRequest;
import com.boki.application.exception.BusinessRuleException;
import com.boki.application.mapper.OrderDtoMapper;
import com.boki.domain.model.book.Book;
import com.boki.domain.model.book.BookCondition;
import com.boki.domain.model.book.BookId;
import com.boki.domain.model.book.Price;
import com.boki.domain.model.user.Email;
import com.boki.domain.model.user.PhoneNumber;
import com.boki.domain.model.user.User;
import com.boki.domain.model.user.UserId;
import com.boki.domain.port.out.BookRepository;
import com.boki.domain.port.out.OrderRepository;
import com.boki.domain.port.out.UserRepository;
import com.boki.infrastructure.persistence.entity.BookVariantJpaEntity;
import com.boki.infrastructure.persistence.repository.BookVariantJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class OrderPurchaseLimitTest {

    private OrderRepository orderRepository;
    private BookRepository bookRepository;
    private UserRepository userRepository;
    private BookVariantJpaRepository variantRepository;
    private ShippingCarrierService shippingCarrierService;
    private OrderDtoMapper orderDtoMapper;
    private FraudDetectionService fraudDetectionService;
    private AutopilotOrderService autopilotOrderService;
    private ServerPricingService serverPricingService;
    private MemberTierService memberTierService;

    private OrderApplicationService orderService;

    private User buyer;
    private Book book;
    private UUID bookId;
    private UUID variantId;
    private BookVariantJpaEntity variant;

    @BeforeEach
    void setUp() {
        orderRepository = Mockito.mock(OrderRepository.class);
        bookRepository = Mockito.mock(BookRepository.class);
        userRepository = Mockito.mock(UserRepository.class);
        variantRepository = Mockito.mock(BookVariantJpaRepository.class);
        shippingCarrierService = Mockito.mock(ShippingCarrierService.class);
        orderDtoMapper = Mockito.mock(OrderDtoMapper.class);
        fraudDetectionService = Mockito.mock(FraudDetectionService.class);
        autopilotOrderService = Mockito.mock(AutopilotOrderService.class);
        serverPricingService = Mockito.mock(ServerPricingService.class);
        memberTierService = Mockito.mock(MemberTierService.class);

        orderService = new OrderApplicationService(
                orderRepository,
                bookRepository,
                userRepository,
                variantRepository,
                shippingCarrierService,
                orderDtoMapper,
                fraudDetectionService,
                autopilotOrderService,
                serverPricingService,
                memberTierService
        );

        bookId = UUID.randomUUID();
        variantId = UUID.randomUUID();

        // Create mock buyer
        buyer = User.register(
                Email.of("buyer@boki.vn"),
                "hash",
                "Buyer Name"
        );
        buyer.verifyPhone(PhoneNumber.of("+84912345678"));
        when(userRepository.findByEmail(Email.of("buyer@boki.vn"))).thenReturn(Optional.of(buyer));

        // Create mock active book with stock = 100
        book = Book.create(
                UserId.generate(),
                "Harry Potter và Hòn Đá Phù Thủy",
                "J.K. Rowling",
                Price.of(new BigDecimal("150000")),
                BookCondition.NEW,
                100,
                Collections.emptyList()
        );
        book.publish();
        when(bookRepository.findById(BookId.of(bookId))).thenReturn(Optional.of(book));

        // Create mock variant
        variant = new BookVariantJpaEntity();
        variant.setId(variantId);
        variant.setName("Bản Giới Hạn");
        variant.setPrice(new BigDecimal("200000"));
        variant.setStockQuantity(50);
        when(variantRepository.findById(variantId)).thenReturn(Optional.of(variant));
    }

    @Test
    @DisplayName("Should reject order when quantity exceeds book-level maxOrderQuantity")
    void testBookLevelLimitExceeded() {
        // Book max limit = 2
        book.updateMaxOrderQuantity(2);

        CreateOrderRequest request = new CreateOrderRequest(
                "123 Nguyen Hue, Q1, HCM",
                List.of(new OrderItemRequest(bookId, null, 3)),
                "COD",
                false,
                null, null, null, null
        );

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () ->
                orderService.createOrder(request, "buyer@boki.vn")
        );

        assertTrue(ex.getMessage().contains("giới hạn tối đa 2 cuốn"));
    }

    @Test
    @DisplayName("Should reject order when quantity exceeds variant-level maxOrderQuantity")
    void testVariantLevelLimitExceeded() {
        // Variant max limit = 1
        variant.setMaxOrderQuantity(1);

        CreateOrderRequest request = new CreateOrderRequest(
                "123 Nguyen Hue, Q1, HCM",
                List.of(new OrderItemRequest(bookId, variantId, 2)),
                "COD",
                false,
                null, null, null, null
        );

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () ->
                orderService.createOrder(request, "buyer@boki.vn")
        );

        assertTrue(ex.getMessage().contains("Bản Giới Hạn"));
        assertTrue(ex.getMessage().contains("giới hạn tối đa 1 sản phẩm"));
    }

    @Test
    @DisplayName("Variant-level limit takes precedence over book-level limit")
    void testVariantLimitPrecedenceOverBookLimit() {
        // Book has limit 1, but variant has limit 3
        book.updateMaxOrderQuantity(1);
        variant.setMaxOrderQuantity(3);

        CreateOrderRequest request = new CreateOrderRequest(
                "123 Nguyen Hue, Q1, HCM",
                List.of(new OrderItemRequest(bookId, variantId, 2)),
                "COD",
                false,
                null, null, null, null
        );

        // Should not throw BusinessRuleException regarding purchase limit
        try {
            orderService.createOrder(request, "buyer@boki.vn");
        } catch (BusinessRuleException ex) {
            assertFalse(ex.getMessage().contains("giới hạn tối đa"),
                    "Should not fail purchase limit check since variant limit (3) is greater than requested (2)");
        } catch (Exception ignored) {
            // Downstream execution (pricing / order creation) may fail in unit test setup
        }
    }

    @Test
    @DisplayName("Should reject when multiple line items for the same item exceed limit in aggregate")
    void testAggregatedLineItemsExceedLimit() {
        book.updateMaxOrderQuantity(2);

        // 2 separate lines of 2 units each = 4 units total
        CreateOrderRequest request = new CreateOrderRequest(
                "123 Nguyen Hue, Q1, HCM",
                List.of(
                        new OrderItemRequest(bookId, null, 2),
                        new OrderItemRequest(bookId, null, 2)
                ),
                "COD",
                false,
                null, null, null, null
        );

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () ->
                orderService.createOrder(request, "buyer@boki.vn")
        );

        assertTrue(ex.getMessage().contains("giới hạn tối đa 2 cuốn"));
    }
}
