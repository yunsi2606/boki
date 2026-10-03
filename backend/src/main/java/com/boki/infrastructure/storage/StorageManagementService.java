package com.boki.infrastructure.storage;

import com.boki.application.dto.response.OrphanFileResponse;
import com.boki.application.dto.response.StorageCleanResultResponse;
import com.boki.application.dto.response.StorageStatsResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.nio.file.*;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class StorageManagementService {

    private static final Logger log = LoggerFactory.getLogger(StorageManagementService.class);

    @Autowired(required = false)
    private S3Client r2S3Client;

    private final DatabaseMediaReferenceService mediaReferenceService;

    @Value("${app.cloudflare.r2.bucket-name:boki-media}")
    private String bucketName;

    @Value("${app.cloudflare.r2.public-url:https://pub-r2.bokistore.vn}")
    private String publicUrl;

    public StorageManagementService(DatabaseMediaReferenceService mediaReferenceService) {
        this.mediaReferenceService = mediaReferenceService;
    }

    public StorageStatsResponse getStorageStats() {
        List<StorageObjectMeta> allObjects = listAllStorageObjects();
        Set<String> activeKeys = mediaReferenceService.getActiveReferencedKeys();

        long totalBytes = 0;
        int usedFiles = 0;
        long usedBytes = 0;
        int orphanFiles = 0;
        long orphanBytes = 0;

        for (StorageObjectMeta obj : allObjects) {
            totalBytes += obj.size();
            if (activeKeys.contains(obj.key())) {
                usedFiles++;
                usedBytes += obj.size();
            } else {
                orphanFiles++;
                orphanBytes += obj.size();
            }
        }

        return new StorageStatsResponse(
                allObjects.size(),
                totalBytes,
                usedFiles,
                usedBytes,
                orphanFiles,
                orphanBytes,
                r2S3Client != null,
                bucketName
        );
    }

    public List<OrphanFileResponse> getOrphanFiles() {
        List<StorageObjectMeta> allObjects = listAllStorageObjects();
        Set<String> activeKeys = mediaReferenceService.getActiveReferencedKeys();

        String basePublicUrl = publicUrl.replaceAll("/$", "");

        return allObjects.stream()
                .filter(obj -> !activeKeys.contains(obj.key()))
                .sorted((a, b) -> b.lastModified().compareTo(a.lastModified()))
                .map(obj -> new OrphanFileResponse(
                        obj.key(),
                        String.format("%s/%s", basePublicUrl, obj.key()),
                        obj.size(),
                        formatBytes(obj.size()),
                        obj.lastModified(),
                        extractExtension(obj.key())
                ))
                .collect(Collectors.toList());
    }

    public void deleteOrphanFile(String rawKey) {
        String key = DatabaseMediaReferenceService.extractKey(rawKey);
        if (key == null) key = rawKey.trim();

        if (r2S3Client != null) {
            try {
                r2S3Client.deleteObject(DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .build());
                log.info("Deleted orphan object from R2: {}", key);
            } catch (Exception e) {
                log.error("Failed to delete object from R2: {} - {}", key, e.getMessage());
            }
        }

        // Also clean local fallback if present
        try {
            Path localPath = Paths.get("uploads", key.replaceFirst("^uploads/", "")).toAbsolutePath();
            Files.deleteIfExists(localPath);
        } catch (Exception ignored) {}
    }

    public StorageCleanResultResponse cleanAllOrphanFiles() {
        List<OrphanFileResponse> orphans = getOrphanFiles();
        Instant safetyThreshold = Instant.now().minus(Duration.ofHours(2));

        // Filter orphans older than 2 hours to avoid deleting files currently being drafted
        List<OrphanFileResponse> eligibleForDeletion = orphans.stream()
                .filter(o -> o.lastModified() == null || o.lastModified().isBefore(safetyThreshold))
                .collect(Collectors.toList());

        int deletedCount = 0;
        long deletedBytes = 0;

        for (OrphanFileResponse orphan : eligibleForDeletion) {
            try {
                deleteOrphanFile(orphan.key());
                deletedCount++;
                deletedBytes += orphan.sizeBytes();
            } catch (Exception e) {
                log.warn("Failed to clean orphan file: {}", orphan.key());
            }
        }

        String msg = String.format("Đã dọn dẹp thành công %d tệp rác, giải phóng %s bộ nhớ.",
                deletedCount, formatBytes(deletedBytes));

        return new StorageCleanResultResponse(deletedCount, deletedBytes, formatBytes(deletedBytes), msg);
    }

    private List<StorageObjectMeta> listAllStorageObjects() {
        List<StorageObjectMeta> results = new ArrayList<>();

        if (r2S3Client != null) {
            try {
                String continuationToken = null;
                do {
                    ListObjectsV2Request.Builder reqBuilder = ListObjectsV2Request.builder()
                            .bucket(bucketName)
                            .prefix("uploads/");
                    if (continuationToken != null) {
                        reqBuilder.continuationToken(continuationToken);
                    }
                    ListObjectsV2Response res = r2S3Client.listObjectsV2(reqBuilder.build());
                    for (S3Object s3Obj : res.contents()) {
                        results.add(new StorageObjectMeta(s3Obj.key(), s3Obj.size(), s3Obj.lastModified()));
                    }
                    continuationToken = res.nextContinuationToken();
                } while (continuationToken != null);

                return results;
            } catch (Exception e) {
                log.error("Failed to list objects from Cloudflare R2: {}", e.getMessage());
            }
        }

        // Fallback: Scan local uploads directory
        Path localUploadsDir = Paths.get("uploads");
        if (Files.exists(localUploadsDir) && Files.isDirectory(localUploadsDir)) {
            try (Stream<Path> stream = Files.walk(localUploadsDir)) {
                stream.filter(Files::isRegularFile).forEach(path -> {
                    try {
                        String relPath = localUploadsDir.relativize(path).toString().replace('\\', '/');
                        String key = "uploads/" + relPath;
                        results.add(new StorageObjectMeta(key, Files.size(path), Files.getLastModifiedTime(path).toInstant()));
                    } catch (IOException ignored) {}
                });
            } catch (Exception ignored) {}
        }

        return results;
    }

    public static String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        char unit = "KMGTPE".charAt(exp - 1);
        return String.format(Locale.US, "%.1f %cB", bytes / Math.pow(1024, exp), unit);
    }

    private String extractExtension(String key) {
        int dot = key.lastIndexOf('.');
        return dot > 0 ? key.substring(dot + 1).toLowerCase(Locale.ROOT) : "";
    }

    private record StorageObjectMeta(String key, long size, Instant lastModified) {}
}
