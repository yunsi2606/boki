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
    private final com.boki.infrastructure.persistence.repository.UserOauthAccountJpaRepository oauthRepository;

    public UserRepositoryAdapter(
            UserJpaRepository jpaRepository,
            com.boki.infrastructure.persistence.repository.UserOauthAccountJpaRepository oauthRepository
    ) {
        this.jpaRepository = jpaRepository;
        this.oauthRepository = oauthRepository;
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

    @Override
    public Optional<User> findByOAuth(String provider, String providerUserId) {
        return oauthRepository.findByProviderAndProviderUserId(provider, providerUserId)
                .map(oauthAccount -> UserPersistenceMapper.toDomainModel(oauthAccount.getUser()));
    }

    @Override
    public void linkOAuthAccount(UserId userId, String provider, String providerUserId) {
        var userEntity = jpaRepository.findById(userId.value())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId.value()));

        boolean exists = oauthRepository.existsByUserIdAndProvider(userId.value(), provider);
        if (!exists) {
            var oauthAccount = new com.boki.infrastructure.persistence.entity.UserOauthAccountJpaEntity();
            oauthAccount.setUser(userEntity);
            oauthAccount.setProvider(provider);
            oauthAccount.setProviderUserId(providerUserId);
            oauthRepository.save(oauthAccount);
        }
    }
}
