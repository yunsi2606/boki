package com.boki.interfaces.rest;

import com.boki.application.dto.request.CreateOrderRequest;
import com.boki.application.dto.response.OrderResponse;
import com.boki.application.port.in.CreateOrderUseCase;
import com.boki.application.port.in.GetOrderUseCase;
import com.boki.infrastructure.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final CreateOrderUseCase createOrderUseCase;
    private final GetOrderUseCase getOrderUseCase;

    public OrderController(CreateOrderUseCase createOrderUseCase, GetOrderUseCase getOrderUseCase) {
        this.createOrderUseCase = createOrderUseCase;
        this.getOrderUseCase = getOrderUseCase;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody CreateOrderRequest request
    ) {
        OrderResponse response = createOrderUseCase.createOrder(request, principal.email());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id:[0-9a-fA-F\\-]{36}}")
    public ResponseEntity<OrderResponse> getOrder(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        OrderResponse response = getOrderUseCase.getOrder(id, principal.email());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getOrders(
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        List<OrderResponse> response = getOrderUseCase.getBuyerOrders(principal.email());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/buyer")
    public ResponseEntity<List<OrderResponse>> getBuyerOrders(
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        List<OrderResponse> response = getOrderUseCase.getBuyerOrders(principal.email());
        return ResponseEntity.ok(response);
    }
}
