package com.boki.interfaces.rest;

import com.boki.application.dto.response.OrphanFileResponse;
import com.boki.application.dto.response.StorageCleanResultResponse;
import com.boki.application.dto.response.StorageStatsResponse;
import com.boki.infrastructure.storage.StorageManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/storage")
public class AdminStorageController {

    private final StorageManagementService storageManagementService;

    public AdminStorageController(StorageManagementService storageManagementService) {
        this.storageManagementService = storageManagementService;
    }

    @GetMapping("/stats")
    public ResponseEntity<StorageStatsResponse> getStorageStats() {
        return ResponseEntity.ok(storageManagementService.getStorageStats());
    }

    @GetMapping("/orphans")
    public ResponseEntity<List<OrphanFileResponse>> getOrphanFiles() {
        return ResponseEntity.ok(storageManagementService.getOrphanFiles());
    }

    @DeleteMapping("/orphans")
    public ResponseEntity<Void> deleteOrphanFile(@RequestParam("key") String key) {
        storageManagementService.deleteOrphanFile(key);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/orphans/clean-all")
    public ResponseEntity<StorageCleanResultResponse> cleanAllOrphanFiles() {
        return ResponseEntity.ok(storageManagementService.cleanAllOrphanFiles());
    }
}
