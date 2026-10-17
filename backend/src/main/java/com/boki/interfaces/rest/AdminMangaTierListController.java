package com.boki.interfaces.rest;

import com.boki.application.dto.schedule.CreateMangaTierListRequest;
import com.boki.application.dto.schedule.MangaTierListDetailDto;
import com.boki.application.dto.schedule.MangaTierListSummaryDto;
import com.boki.application.dto.schedule.UpdateMangaTierListRequest;
import com.boki.application.service.AdminMangaTierListService;
import com.boki.infrastructure.security.AuthenticatedUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/manga-tier-lists")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
public class AdminMangaTierListController {

    private final AdminMangaTierListService adminService;

    @GetMapping
    public ResponseEntity<List<MangaTierListSummaryDto>> getAllForAdmin(
            @RequestParam(name = "keyword", required = false) String keyword
    ) {
        return ResponseEntity.ok(adminService.getAllForAdmin(keyword));
    }

    @PostMapping
    public ResponseEntity<MangaTierListDetailDto> createTierList(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody CreateMangaTierListRequest request
    ) {
        UUID userId = principal != null ? principal.userId() : UUID.fromString("00000000-0000-0000-0000-000000000001");
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createTierList(userId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MangaTierListDetailDto> updateTierList(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateMangaTierListRequest request
    ) {
        return ResponseEntity.ok(adminService.updateTierList(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTierList(@PathVariable("id") UUID id) {
        adminService.deleteTierList(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-public")
    public ResponseEntity<Map<String, Object>> togglePublic(@PathVariable("id") UUID id) {
        boolean newStatus = adminService.togglePublic(id);
        return ResponseEntity.ok(Map.of("id", id, "isPublic", newStatus));
    }
}
