package com.boki.application.port.out;

/**
 * Port (outbound) for password hashing.
 */
public interface PasswordEncoder {

    String encode(String rawPassword);

    boolean matches(String rawPassword, String encodedPassword);
}
