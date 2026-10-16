package com.boki.interfaces.rest;

import com.boki.application.dto.schedule.UpdateUserMangaCollectionRequest;
import com.boki.application.dto.schedule.UserMangaCollectionDto;
import com.boki.application.service.UserMangaCollectionService;
import com.boki.infrastructure.security.AuthenticatedUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/user-collections")
@RequiredArgsConstructor
public class UserMangaCollectionController {

    private final UserMangaCollectionService collectionService;

    @GetMapping
    public ResponseEntity<List<UserMangaCollectionDto>> getUserCollection(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @RequestParam(name = "status", required = false) String status
    ) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(collectionService.getUserCollection(principal.userId(), status));
    }

    @PostMapping
    public ResponseEntity<UserMangaCollectionDto> upsertItem(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody UpdateUserMangaCollectionRequest request
    ) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(collectionService.upsertCollectionItem(principal.userId(), request));
    }

    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<Void> deleteItem(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @PathVariable("scheduleId") UUID scheduleId
    ) {
        if (principal == null) return ResponseEntity.status(401).build();
        collectionService.deleteCollectionItem(principal.userId(), scheduleId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(collectionService.getCollectionStats(principal.userId()));
    }
}
