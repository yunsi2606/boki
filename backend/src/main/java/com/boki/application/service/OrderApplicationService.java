package com.boki.application.service;

import com.boki.application.dto.request.CreateOrderRequest;
import com.boki.application.dto.request.OrderItemRequest;
import com.boki.application.dto.response.OrderResponse;
import com.boki.application.exception.BusinessRuleException;
import com.boki.application.exception.ResourceNotFoundException;
import com.boki.application.mapper.OrderDtoMapper;
import com.boki.application.port.in.CreateOrderUseCase;
import com.boki.application.port.in.GetOrderUseCase;
import com.boki.domain.model.book.Book;
import com.boki.domain.model.book.BookId;
import com.boki.domain.model.order.*;
import com.boki.domain.model.user.Email;
import com.boki.domain.model.user.User;
import com.boki.domain.port.out.BookRepository;
import com.boki.domain.port.out.OrderRepository;
import com.boki.domain.port.out.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderApplicationService implements CreateOrderUseCase, GetOrderUseCase {

    private final OrderRepository orderRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final OrderDtoMapper orderDtoMapper;

    public OrderApplicationService(
            OrderRepository orderRepository,
            BookRepository bookRepository,
            UserRepository userRepository,
            OrderDtoMapper orderDtoMapper
    ) {
        this.orderRepository = orderRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.orderDtoMapper = orderDtoMapper;
    }

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, String buyerEmail) {
        User buyer = userRepository.findByEmail(Email.of(buyerEmail))
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", buyerEmail));

        if (!buyer.isPhoneVerified()) {
            throw new BusinessRuleException("Phone number verification is required before placing an order");
        }

        List<OrderItem> domainItems = new ArrayList<>();
        
        for (OrderItemRequest itemReq : request.items()) {
            Book book = bookRepository.findById(BookId.of(itemReq.bookId()))
                    .orElseThrow(() -> new ResourceNotFoundException("Book", "id", itemReq.bookId()));

            if (!book.isAvailableForPurchase()) {
                throw new BusinessRuleException("Book '" + book.getTitle() + "' is not available for purchase");
            }

            // Decrement book inventory
            book.decrementStock(itemReq.quantity());
            bookRepository.save(book);

            OrderItem domainItem = new OrderItem(
                    book.getId(),
                    itemReq.quantity(),
                    book.getPrice().amount()
            );
            domainItems.add(domainItem);
        }

        Order order = Order.create(
                buyer.getId(),
                domainItems,
                request.shippingAddress(),
                "VND"
        );

        Order savedOrder = orderRepository.save(order);
        return orderDtoMapper.toResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrder(UUID orderId, String email) {
        User user = userRepository.findByEmail(Email.of(email))
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        Order order = orderRepository.findById(OrderId.of(orderId))
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getBuyerId().equals(user.getId())) {
            throw new BusinessRuleException("Access denied to this order's details");
        }

        return orderDtoMapper.toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getBuyerOrders(String buyerEmail) {
        User buyer = userRepository.findByEmail(Email.of(buyerEmail))
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", buyerEmail));

        return orderRepository.findByBuyerId(buyer.getId())
                .stream()
                .map(orderDtoMapper::toResponse)
                .collect(Collectors.toList());
    }
}
