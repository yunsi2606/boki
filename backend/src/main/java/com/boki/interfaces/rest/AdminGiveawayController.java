package com.boki.interfaces.rest;

import com.boki.application.dto.giveaway.*;
import com.boki.application.service.GiveawayApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/giveaways")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
public class AdminGiveawayController {

    private final GiveawayApplicationService giveawayService;

    @GetMapping
    public ResponseEntity<Page<GiveawayCampaignDto>> getCampaigns(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(giveawayService.getAdminCampaigns(status, pageable));
    }

    @PostMapping
    public ResponseEntity<GiveawayCampaignDetailDto> createCampaign(
            @Valid @RequestBody CreateGiveawayCampaignRequest request
    ) {
        return ResponseEntity.ok(giveawayService.createCampaign(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GiveawayCampaignDetailDto> updateCampaign(
            @PathVariable UUID id,
            @Valid @RequestBody CreateGiveawayCampaignRequest request
    ) {
        return ResponseEntity.ok(giveawayService.updateCampaign(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteCampaign(@PathVariable UUID id) {
        giveawayService.deleteCampaign(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Xóa sự kiện Give Away thành công."));
    }

    @GetMapping("/{id}/entries")
    public ResponseEntity<Page<GiveawayEntryDto>> getEntries(
            @PathVariable UUID id,
            @PageableDefault(size = 50, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(giveawayService.getCampaignEntries(id, pageable));
    }

    @PostMapping("/{id}/preview-draw")
    public ResponseEntity<DrawPreviewResponse> previewDraw(
            @PathVariable UUID id,
            @RequestParam Integer winningNumber
    ) {
        return ResponseEntity.ok(giveawayService.previewDraw(id, winningNumber));
    }

    @PostMapping("/{id}/draw")
    public ResponseEntity<DrawPreviewResponse> executeDraw(
            @PathVariable UUID id,
            @Valid @RequestBody DrawGiveawayRequest request
    ) {
        return ResponseEntity.ok(giveawayService.executeDraw(id, request));
    }
}
