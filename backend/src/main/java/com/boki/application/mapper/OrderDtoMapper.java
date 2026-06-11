package com.boki.application.mapper;

import com.boki.application.dto.response.OrderItemResponse;
import com.boki.application.dto.response.OrderResponse;
import com.boki.domain.model.book.Book;
import com.boki.domain.model.order.Order;
import com.boki.domain.model.order.OrderItem;
import com.boki.domain.port.out.BookRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class OrderDtoMapper {

    private final BookRepository bookRepository;

    public OrderDtoMapper(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public OrderResponse toResponse(Order order) {
        if (order == null) {
            return null;
        }

        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList());

        return new OrderResponse(
                order.getId().value(),
                order.getBuyerId().value(),
                order.getTotalAmount(),
                order.getCurrency(),
                order.getStatus().name(),
                order.getShippingAddress(),
                itemResponses,
                order.getCreatedAt(),
                order.getUpdatedAt()
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
}
