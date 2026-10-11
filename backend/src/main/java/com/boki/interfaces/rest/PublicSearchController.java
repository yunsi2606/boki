package com.boki.interfaces.rest;

import com.boki.application.service.HotSearchApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/search")
@RequiredArgsConstructor
public class PublicSearchController {

    private final HotSearchApplicationService hotSearchService;

    @GetMapping("/hot-keywords")
    public ResponseEntity<List<String>> getHotKeywords() {
        return ResponseEntity.ok(hotSearchService.getHotKeywords());
    }
}
