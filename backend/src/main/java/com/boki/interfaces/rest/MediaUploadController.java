package com.boki.interfaces.rest;

import com.boki.infrastructure.storage.CloudflareR2StorageService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/media")
public class MediaUploadController {

    private final CloudflareR2StorageService storageService;

    public MediaUploadController(CloudflareR2StorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String url = storageService.uploadFile(file);
            return ResponseEntity.ok(Map.of(
                "url", url,
                "filename", file.getOriginalFilename() != null ? file.getOriginalFilename() : "uploaded_file"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to process image file upload: " + e.getMessage()));
        }
    }
}
