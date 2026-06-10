package com.boki.domain.port.out;

import com.boki.domain.model.user.Email;
import com.boki.domain.model.user.User;
import com.boki.domain.model.user.UserId;

import java.util.Optional;

/**
 * Port (outbound) for user persistence.
 * Defined in domain — implemented in infrastructure.
 */
public interface UserRepository {

    User save(User user);

    Optional<User> findById(UserId id);

    Optional<User> findByEmail(Email email);

    boolean existsByEmail(Email email);

    void deleteById(UserId id);
}
