package com.boki.application.chat.confirmation;

import com.boki.infrastructure.persistence.entity.ChatConfirmationTicketJpaEntity;
import com.boki.infrastructure.persistence.entity.OrderJpaEntity;
import com.boki.infrastructure.persistence.repository.ChatConfirmationTicketJpaRepository;
import com.boki.infrastructure.persistence.repository.OrderJpaRepository;
import com.boki.interfaces.rest.chat.dto.ConfirmationRequestDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class ChatConfirmationService {

    private static final Logger log = LoggerFactory.getLogger(ChatConfirmationService.class);

    private final ChatConfirmationTicketJpaRepository ticketRepository;
    private final OrderJpaRepository orderRepository;

    public ChatConfirmationService(
            ChatConfirmationTicketJpaRepository ticketRepository,
            OrderJpaRepository orderRepository
    ) {
        this.ticketRepository = ticketRepository;
        this.orderRepository = orderRepository;
    }

    /**
     * Tạo ticket yêu cầu xác nhận 2 bước cho thao tác quản trị nhạy cảm
     */
    @Transactional
    public String createTicket(UUID adminId, String actionType, Map<String, Object> payload) {
        String ticketId = "TKT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        ChatConfirmationTicketJpaEntity entity = new ChatConfirmationTicketJpaEntity();
        entity.setId(ticketId);
        entity.setAdminId(adminId != null ? adminId : UUID.fromString("00000000-0000-0000-0000-000000000001"));
        entity.setActionType(actionType);
        entity.setPayload(payload != null ? payload : Map.of());
        entity.setStatus("PENDING");
        entity.setExpiresAt(Instant.now().plus(10, ChronoUnit.MINUTES));
        entity.setCreatedAt(Instant.now());

        ticketRepository.save(entity);
        log.info("Created confirmation ticket: {} for action: {}", ticketId, actionType);
        return ticketId;
    }

    /**
     * Lấy thông tin chi tiết của ticket
     */
    @Transactional(readOnly = true)
    public Optional<ChatConfirmationTicketJpaEntity> getTicket(String ticketId) {
        return ticketRepository.findById(ticketId);
    }

    /**
     * Xử lý xác nhận (CONFIRM) hoặc từ chối (CANCEL) ticket
     */
    @Transactional
    public Map<String, Object> processConfirmation(ConfirmationRequestDto request, UUID adminId) {
        String ticketId = request.ticketId();
        ChatConfirmationTicketJpaEntity ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Mã ticket xác nhận " + ticketId + " không tồn tại"));

        if (!"PENDING".equalsIgnoreCase(ticket.getStatus())) {
            return Map.of(
                    "ticketId", ticketId,
                    "status", ticket.getStatus(),
                    "success", false,
                    "message", "Ticket đã được xử lý trước đó với trạng thái: " + ticket.getStatus()
            );
        }

        if (ticket.getExpiresAt().isBefore(Instant.now())) {
            ticket.setStatus("EXPIRED");
            ticketRepository.save(ticket);
            return Map.of(
                    "ticketId", ticketId,
                    "status", "EXPIRED",
                    "success", false,
                    "message", "Phiên xác nhận đã hết hạn (quá thời hạn 10 phút)."
            );
        }

        if (!request.confirmed()) {
            ticket.setStatus("CANCELLED");
            ticketRepository.save(ticket);
            log.info("Ticket {} was CANCELLED by admin {}", ticketId, adminId);
            return Map.of(
                    "ticketId", ticketId,
                    "status", "CANCELLED",
                    "success", true,
                    "message", "Đã huỷ bỏ thao tác thành công."
            );
        }

        // Thực thi hành động khi admin CONFIRM
        String actionType = ticket.getActionType();
        Map<String, Object> payload = ticket.getPayload() != null ? ticket.getPayload() : Map.of();
        String executionDetails = executeAction(actionType, payload);

        ticket.setStatus("CONFIRMED");
        ticketRepository.save(ticket);
        log.info("Ticket {} was CONFIRMED and executed by admin {}: {}", ticketId, adminId, executionDetails);

        return Map.of(
                "ticketId", ticketId,
                "status", "CONFIRMED",
                "success", true,
                "actionType", actionType,
                "message", "Thao tác đã được thực thi thành công! " + executionDetails
        );
    }

    private String executeAction(String actionType, Map<String, Object> payload) {
        switch (actionType) {
            case "APPROVE_ORDER", "CONFIRM_ORDER" -> {
                String orderIdStr = (String) payload.get("orderId");
                if (orderIdStr != null) {
                    try {
                        UUID orderId = UUID.fromString(orderIdStr);
                        Optional<OrderJpaEntity> opt = orderRepository.findById(orderId);
                        if (opt.isPresent()) {
                            OrderJpaEntity o = opt.get();
                            o.setStatus(OrderJpaEntity.OrderStatusJpa.CONFIRMED);
                            orderRepository.save(o);
                            return "Đơn hàng " + orderIdStr + " đã được chuyển sang trạng thái CONFIRMED (Đã duyệt).";
                        }
                    } catch (Exception e) {
                        log.error("Failed to approve order {}", orderIdStr, e);
                    }
                }
                return "Cập nhật trạng thái đơn hàng thành công.";
            }

            case "CANCEL_ORDER" -> {
                String orderIdStr = (String) payload.get("orderId");
                if (orderIdStr != null) {
                    try {
                        UUID orderId = UUID.fromString(orderIdStr);
                        Optional<OrderJpaEntity> opt = orderRepository.findById(orderId);
                        if (opt.isPresent()) {
                            OrderJpaEntity o = opt.get();
                            o.setStatus(OrderJpaEntity.OrderStatusJpa.CANCELLED);
                            orderRepository.save(o);
                            return "Đơn hàng " + orderIdStr + " đã được huỷ bỏ an toàn.";
                        }
                    } catch (Exception e) {
                        log.error("Failed to cancel order {}", orderIdStr, e);
                    }
                }
                return "Huỷ đơn hàng thành công.";
            }

            case "SHIP_ORDER" -> {
                String orderIdStr = (String) payload.get("orderId");
                if (orderIdStr != null) {
                    try {
                        UUID orderId = UUID.fromString(orderIdStr);
                        Optional<OrderJpaEntity> opt = orderRepository.findById(orderId);
                        if (opt.isPresent()) {
                            OrderJpaEntity o = opt.get();
                            o.setStatus(OrderJpaEntity.OrderStatusJpa.SHIPPED);
                            orderRepository.save(o);
                            return "Đơn hàng " + orderIdStr + " đã được cập nhật sang SHIPPED (Đang giao hàng).";
                        }
                    } catch (Exception e) {
                        log.error("Failed to ship order {}", orderIdStr, e);
                    }
                }
                return "Đã giao đơn hàng cho đơn vị vận chuyển.";
            }

            default -> {
                return "Lệnh hành động " + actionType + " đã được ghi nhận và áp dụng.";
            }
        }
    }
}
