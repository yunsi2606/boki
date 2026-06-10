package com.boki.domain.model.book;

import java.util.UUID;

/**
 * Value Object for book identity.
 */
public record BookId(UUID value) {

    public BookId {
        if (value == null) {
            throw new IllegalArgumentException("BookId cannot be null");
        }
    }

    public static BookId of(UUID value) {
        return new BookId(value);
    }

    public static BookId generate() {
        return new BookId(UUID.randomUUID());
    }

    @Override
    public String toString() {
        return value.toString();
    }
}
