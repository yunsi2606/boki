package com.boki.application.dto.response;

/**
 * Result summary returned after deleting orphan files.
 */
public record StorageCleanResultResponse(
        int deletedCount,
        long deletedBytes,
        String deletedBytesFormatted,
        String message
) {
}
