package com.boki.interfaces.rest;

import com.boki.application.dto.schedule.MangaTierListDetailDto;
import com.boki.application.dto.schedule.MangaTierListSummaryDto;
import com.boki.application.service.MangaTierListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/manga-tier-lists")
@RequiredArgsConstructor
public class MangaTierListController {

    private final MangaTierListService tierListService;

    @GetMapping("/top-public")
    public ResponseEntity<List<MangaTierListSummaryDto>> getTopPublicTierLists(
            @RequestParam(name = "limit", defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(tierListService.getTopPublicTierLists(limit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MangaTierListDetailDto> getTierListDetail(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(tierListService.getTierListDetail(id));
    }
}
