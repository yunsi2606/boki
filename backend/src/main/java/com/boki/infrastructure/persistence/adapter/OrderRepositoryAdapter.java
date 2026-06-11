package com.boki.infrastructure.persistence.adapter;

import com.boki.domain.model.order.Order;
import com.boki.domain.model.order.OrderId;
import com.boki.domain.model.user.UserId;
import com.boki.domain.port.out.OrderRepository;
import com.boki.infrastructure.persistence.entity.OrderJpaEntity;
import com.boki.infrastructure.persistence.mapper.OrderPersistenceMapper;
import com.boki.infrastructure.persistence.repository.OrderJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
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
        OrderJpaEntity savedEntity = jpaRepository.save(entity);
        return OrderPersistenceMapper.toDomainModel(savedEntity);
    }

    @Override
    public Optional<Order> findById(OrderId id) {
        return jpaRepository.findById(id.value())
                .map(OrderPersistenceMapper::toDomainModel);
    }

    @Override
    public List<Order> findByBuyerId(UserId buyerId) {
        return jpaRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId.value())
                .stream()
                .map(OrderPersistenceMapper::toDomainModel)
                .collect(Collectors.toList());
    }
}
