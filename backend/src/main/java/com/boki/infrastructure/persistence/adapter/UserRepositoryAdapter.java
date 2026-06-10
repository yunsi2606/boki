package com.boki.infrastructure.persistence.adapter;

import com.boki.domain.model.user.Email;
import com.boki.domain.model.user.User;
import com.boki.domain.model.user.UserId;
import com.boki.domain.port.out.UserRepository;
import com.boki.infrastructure.persistence.mapper.UserPersistenceMapper;
import com.boki.infrastructure.persistence.repository.UserJpaRepository;

import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Adapter implementing the domain UserRepository port using Spring Data JPA.
 */
@Component
public class UserRepositoryAdapter implements UserRepository {

    private final UserJpaRepository jpaRepository;

    public UserRepositoryAdapter(UserJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public User save(User user) {
        var entity = UserPersistenceMapper.toJpaEntity(user);
        var savedEntity = jpaRepository.save(entity);
        return UserPersistenceMapper.toDomainModel(savedEntity);
    }

    @Override
    public Optional<User> findById(UserId id) {
        return jpaRepository.findById(id.value())
                .map(UserPersistenceMapper::toDomainModel);
    }

    @Override
    public Optional<User> findByEmail(Email email) {
        return jpaRepository.findByEmail(email.value())
                .map(UserPersistenceMapper::toDomainModel);
    }

    @Override
    public boolean existsByEmail(Email email) {
        return jpaRepository.existsByEmail(email.value());
    }

    @Override
    public void deleteById(UserId id) {
        jpaRepository.deleteById(id.value());
    }
}
