package com.boki.application.mapper;

import com.boki.application.dto.response.OrderItemResponse;
import com.boki.application.dto.response.OrderResponse;
import com.boki.application.dto.response.OrderTimelineResponse;
import com.boki.domain.model.book.Book;
import com.boki.domain.model.order.Order;
import com.boki.domain.model.order.OrderItem;
import com.boki.domain.model.order.OrderTimeline;
import com.boki.domain.model.user.User;
import com.boki.domain.port.out.BookRepository;
import com.boki.domain.port.out.UserRepository;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class OrderDtoMapper {

    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    public OrderDtoMapper(BookRepository bookRepository, UserRepository userRepository, com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    public OrderResponse toResponse(Order order) {
        if (order == null) {
            return null;
        }

        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList());

        List<OrderTimelineResponse> timelineResponses = order.getTimelines() != null
                ? order.getTimelines().stream()
                .map(this::toTimelineResponse)
                .collect(Collectors.toList())
                : Collections.emptyList();

        // Resolve customer name and phone from User or guest fields or parse from shippingAddress
        String customerName = "Khách hàng Boki";
        String customerPhone = "---";

        if (Boolean.TRUE.equals(order.getIsGuest())) {
            customerName = (order.getGuestName() != null && !order.getGuestName().isBlank())
                    ? order.getGuestName() : "Khách vãng lai";
            customerPhone = (order.getGuestPhone() != null && !order.getGuestPhone().isBlank())
                    ? order.getGuestPhone() : "---";
        } else {
            Optional<User> buyerOpt = userRepository.findById(order.getBuyerId());
            if (buyerOpt.isPresent()) {
                User buyer = buyerOpt.get();
                if (buyer.getDisplayName() != null && !buyer.getDisplayName().isBlank()) {
                    customerName = buyer.getDisplayName();
                }
                if (buyer.getPhoneNumber() != null && buyer.getPhoneNumber().value() != null && !buyer.getPhoneNumber().value().isBlank()) {
                    customerPhone = buyer.getPhoneNumber().value();
                }
            }
        }

        // Fallback: parse from shippingAddress formatted as "Name | SĐT: Phone | Address..."
        if (order.getShippingAddress() != null && order.getShippingAddress().contains("|")) {
            String[] parts = order.getShippingAddress().split("\\|");
            if (parts.length > 0 && !parts[0].trim().isBlank() && ("Khách hàng Boki".equals(customerName) || "Khách vãng lai".equals(customerName))) {
                customerName = parts[0].trim();
            }
            if (parts.length > 1 && parts[1].contains("SĐT:") && "---".equals(customerPhone)) {
                customerPhone = parts[1].replace("SĐT:", "").trim();
            }
        }

        List<String> riskReasonsList = Collections.emptyList();
        if (order.getRiskReasons() != null && !order.getRiskReasons().isBlank()) {
            try {
                riskReasonsList = objectMapper.readValue(order.getRiskReasons(),
                        objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
            } catch (Exception e) {
                riskReasonsList = List.of(order.getRiskReasons());
            }
        }

        return new OrderResponse(
                order.getId().value(),
                order.getBuyerId().value(),
                customerName,
                customerPhone,
                order.getTotalAmount(),
                order.getCurrency(),
                order.getStatus().name(),
                order.getShippingAddress(),
                order.getCarrierName(),
                order.getTrackingNumber(),
                order.getShippingFee(),
                order.getEstimatedDelivery(),
                order.getWeightGrams(),
                order.getCancelReason(),
                order.getCancelledBy(),
                order.getCarrierStatus(),
                order.getPaymentMethod() != null ? order.getPaymentMethod().name() : "COD",
                order.getPaymentStatus() != null ? order.getPaymentStatus().name() : "UNPAID",
                order.getPaymentCode(),
                order.getPaidAt(),
                itemResponses,
                timelineResponses,
                order.getCreatedAt(),
                order.getUpdatedAt(),
                order.getRiskScore(),
                order.getRiskLevel(),
                riskReasonsList,
                order.getIsFlagged(),
                order.getIsGuest(),
                order.getSubtotalAmount(),
                order.getMemberTier(),
                order.getMemberDiscountAmount(),
                order.getVoucherCode(),
                order.getVoucherDiscountAmount()
        );
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        Optional<Book> bookOpt = bookRepository.findById(item.bookId());
        String title = bookOpt.map(Book::getTitle).orElse("Sách không tìm thấy");
        String cover = bookOpt.map(book -> {
            List<String> urls = book.getImageUrls();
            return (urls != null && !urls.isEmpty()) ? urls.get(0) : "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=200";
        }).orElse("https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=200");

        return new OrderItemResponse(
                item.bookId().value(),
                title,
                cover,
                item.quantity(),
                item.unitPrice(),
                item.subtotal()
        );
    }

    private OrderTimelineResponse toTimelineResponse(OrderTimeline tl) {
        return new OrderTimelineResponse(
                tl.getId(),
                tl.getStatus(),
                tl.getTitle(),
                tl.getDescription(),
                tl.getActor(),
                tl.getCreatedAt()
        );
    }
}
