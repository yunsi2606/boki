package com.boki.infrastructure.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class CloudflareR2StorageService {

    private static final Logger log = LoggerFactory.getLogger(CloudflareR2StorageService.class);

    @Autowired(required = false)
    private S3Client r2S3Client;

    @Value("${app.cloudflare.r2.bucket-name:boki-media}")
    private String bucketName;

    @Value("${app.cloudflare.r2.public-url:https://pub-r2.bokistore.vn}")
    private String publicUrl;

    public String uploadFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File upload cannot be empty.");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String objectKey = String.format("uploads/%s/%s%s", datePrefix, UUID.randomUUID(), extension);

        // Attempt Cloudflare R2 Upload if client is initialized
        if (r2S3Client != null) {
            try {
                log.info("Uploading file to Cloudflare R2 bucket: {}, key: {}", bucketName, objectKey);
                PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(objectKey)
                        .contentType(file.getContentType())
                        .build();

                r2S3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

                String cdnUrl = String.format("%s/%s", publicUrl.replaceAll("/$", ""), objectKey);
                log.info("File uploaded successfully to Cloudflare R2: {}", cdnUrl);
                return cdnUrl;

            } catch (Exception e) {
                log.error("Cloudflare R2 upload failed, falling back to local storage: {}", e.getMessage());
            }
        }

        // Fallback: Local Disk Storage
        return saveToLocalStorage(file, objectKey);
    }

    private String saveToLocalStorage(MultipartFile file, String objectKey) throws IOException {
        Path uploadPath = Paths.get("uploads", objectKey).toAbsolutePath();
        Files.createDirectories(uploadPath.getParent());
        file.transferTo(uploadPath.toFile());
        log.info("Saved file locally at: {}", uploadPath);

        // Return relative or localhost endpoint URL
        return String.format("http://localhost:8080/uploads/%s", objectKey);
    }

    /**
     * Delete a file from R2 by its public URL.
     * Extracts the object key from the URL and issues a DeleteObject request.
     */
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return;

        // Extract object key from URL
        String objectKey = extractObjectKey(fileUrl);
        if (objectKey == null) {
            log.warn("Cannot extract object key from URL: {}", fileUrl);
            return;
        }

        if (r2S3Client != null) {
            try {
                DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(objectKey)
                        .build();
                r2S3Client.deleteObject(deleteRequest);
                log.info("Deleted file from R2: {}", objectKey);
            } catch (Exception e) {
                log.error("Failed to delete file from R2: {} - {}", objectKey, e.getMessage());
            }
        } else {
            // Fallback: delete from local storage
            try {
                Path localPath = Paths.get("uploads", objectKey).toAbsolutePath();
                Files.deleteIfExists(localPath);
                log.info("Deleted local file: {}", localPath);
            } catch (Exception e) {
                log.warn("Failed to delete local file: {}", e.getMessage());
            }
        }
    }

    private String extractObjectKey(String fileUrl) {
        // R2 URL format: https://pub-r2.bokistore.vn/uploads/2026/09/20/uuid.jpg
        // Local URL format: http://localhost:8080/uploads/2026/09/20/uuid.jpg
        int uploadsIndex = fileUrl.indexOf("uploads/");
        if (uploadsIndex >= 0) {
            return fileUrl.substring(uploadsIndex);
        }
        return null;
    }
}

