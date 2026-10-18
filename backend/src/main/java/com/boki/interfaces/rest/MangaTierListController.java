package com.boki.interfaces.rest;

import com.boki.application.dto.schedule.*;
import com.boki.application.service.MangaTierListService;
import com.boki.infrastructure.security.AuthenticatedUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/manga-tier-lists")
@RequiredArgsConstructor
public class MangaTierListController {

    private final MangaTierListService tierListService;

    @GetMapping("/top-public")
    public ResponseEntity<List<MangaTierListSummaryDto>> getTopPublicTierLists(
            @RequestParam(name = "limit", defaultValue = "4") int limit,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        UUID currentUserId = principal != null ? principal.userId() : null;
        return ResponseEntity.ok(tierListService.getTopPublicTierLists(limit, currentUserId));
    }

    @GetMapping
    public ResponseEntity<List<MangaTierListSummaryDto>> getAllPublic(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        UUID currentUserId = principal != null ? principal.userId() : null;
        return ResponseEntity.ok(tierListService.getAllPublic(page, size, currentUserId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<MangaTierListSummaryDto>> getMyTierLists(
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(tierListService.getMyTierLists(principal.userId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MangaTierListDetailDto> getTierListDetail(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        UUID currentUserId = principal != null ? principal.userId() : null;
        return ResponseEntity.ok(tierListService.getTierListDetail(id, currentUserId));
    }

    @PostMapping
    public ResponseEntity<MangaTierListDetailDto> createTierList(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody CreateMangaTierListRequest request
    ) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(tierListService.createTierList(principal.userId(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MangaTierListDetailDto> updateTierList(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody UpdateMangaTierListRequest request
    ) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(tierListService.updateTierList(principal.userId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTierList(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        tierListService.deleteTierList(principal.userId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        boolean liked = tierListService.toggleLike(principal.userId(), id);
        return ResponseEntity.ok(Map.of("liked", liked));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<Void> recordView(@PathVariable("id") UUID id) {
        tierListService.recordView(id);
        return ResponseEntity.ok().build();
    }
}
