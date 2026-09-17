package com.boki.infrastructure.persistence.adapter;

import com.boki.domain.port.out.OrderRepository;
import com.boki.domain.model.order.Order;
import com.boki.domain.model.order.OrderId;
import com.boki.domain.model.order.OrderStatus;
import com.boki.domain.model.user.UserId;
import com.boki.infrastructure.persistence.entity.OrderJpaEntity;
import com.boki.infrastructure.persistence.mapper.OrderPersistenceMapper;
import com.boki.infrastructure.persistence.repository.OrderJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class OrderRepositoryAdapter implements OrderRepository {

    private final OrderJpaRepository jpaRepository;

    public OrderRepositoryAdapter(OrderJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Order save(Order order) {
        OrderJpaEntity entity = OrderPersistenceMapper.toJpaEntity(order);
        OrderJpaEntity saved = jpaRepository.save(entity);
        return OrderPersistenceMapper.toDomainModel(saved);
    }

    @Override
    public Optional<Order> findById(OrderId id) {
        return jpaRepository.findById(id.value())
                .map(OrderPersistenceMapper::toDomainModel);
    }

    @Override
    public Optional<Order> findByTrackingNumber(String trackingNumber) {
        if (trackingNumber == null || trackingNumber.isBlank()) return Optional.empty();
        return jpaRepository.findByTrackingNumber(trackingNumber.trim())
                .map(OrderPersistenceMapper::toDomainModel);
    }

    @Override
    public List<Order> findByBuyerId(UserId buyerId) {
        return jpaRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId.value())
                .stream()
                .map(OrderPersistenceMapper::toDomainModel)
                .collect(Collectors.toList());
    }

    @Override
    public List<Order> searchOrders(OrderStatus status, String search, int page, int size) {
        OrderJpaEntity.OrderStatusJpa jpaStatus = status != null ? OrderJpaEntity.OrderStatusJpa.valueOf(status.name()) : null;
        Pageable pageable = PageRequest.of(page, size);
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        Page<OrderJpaEntity> pageResult;
        if (jpaStatus == null && cleanSearch == null) {
            pageResult = jpaRepository.findAllByOrderByCreatedAtDesc(pageable);
        } else if (jpaStatus != null && cleanSearch == null) {
            pageResult = jpaRepository.findByStatusOrderByCreatedAtDesc(jpaStatus, pageable);
        } else if (jpaStatus == null) {
            pageResult = jpaRepository.searchByKeyword(cleanSearch, pageable);
        } else {
            pageResult = jpaRepository.searchByStatusAndKeyword(jpaStatus, cleanSearch, pageable);
        }

        return pageResult
                .getContent()
                .stream()
                .map(OrderPersistenceMapper::toDomainModel)
                .collect(Collectors.toList());
    }
}
