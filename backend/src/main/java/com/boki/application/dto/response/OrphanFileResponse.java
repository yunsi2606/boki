package com.boki.application.dto.response;

import java.time.Instant;

/**
 * Representation of an unused/orphan file found in Cloudflare R2 storage.
 */
public record OrphanFileResponse(
        String key,
        String url,
        long sizeBytes,
        String sizeFormatted,
        Instant lastModified,
        String extension
) {
}
