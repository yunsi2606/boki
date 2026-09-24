package com.boki.domain.model.blog;

import java.util.UUID;

/**
 * Blog identity value object.
 */
public record BlogId(UUID value) {

    public static BlogId generate() {
        return new BlogId(UUID.randomUUID());
    }

    public static BlogId of(UUID value) {
        return new BlogId(value);
    }

    @Override
    public String toString() {
        return value.toString();
    }
}
