package com.boki.application.dto.response;

/**
 * Statistics on Cloudflare R2 storage usage and orphan files.
 */
public record StorageStatsResponse(
        int totalFiles,
        long totalBytes,
        int usedFiles,
        long usedBytes,
        int orphanFiles,
        long orphanBytes,
        boolean r2Connected,
        String bucketName
) {
}
