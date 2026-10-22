package com.boki.interfaces.rest;

import com.boki.application.dto.giveaway.GiveawayCampaignDetailDto;
import com.boki.application.dto.giveaway.GiveawayCampaignDto;
import com.boki.application.dto.giveaway.GiveawayEntryDto;
import com.boki.application.dto.giveaway.GiveawaySubmitEntryRequest;
import com.boki.application.service.GiveawayApplicationService;
import com.boki.infrastructure.security.AuthenticatedUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/giveaways")
@RequiredArgsConstructor
public class PublicGiveawayController {

    private final GiveawayApplicationService giveawayService;

    @GetMapping
    public ResponseEntity<Page<GiveawayCampaignDto>> getCampaigns(
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(giveawayService.getPublicCampaigns(pageable));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<GiveawayCampaignDetailDto> getCampaignDetail(@PathVariable String slug) {
        return ResponseEntity.ok(giveawayService.getPublicCampaignDetail(slug));
    }

    @PostMapping("/{slug}/entries")
    public ResponseEntity<GiveawayEntryDto> submitEntry(
            @PathVariable String slug,
            @Valid @RequestBody GiveawaySubmitEntryRequest request,
            @AuthenticationPrincipal AuthenticatedUser authUser
    ) {
        UUID userId = authUser != null ? authUser.userId() : null;
        return ResponseEntity.ok(giveawayService.submitEntry(slug, request, userId));
    }
}
