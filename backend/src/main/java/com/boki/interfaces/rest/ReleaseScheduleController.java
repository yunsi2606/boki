package com.boki.interfaces.rest;

import com.boki.application.dto.schedule.CreateReleaseScheduleRequest;
import com.boki.application.dto.schedule.ReleaseScheduleDto;
import com.boki.application.dto.schedule.UpdateReleaseScheduleRequest;
import com.boki.application.service.ReleaseScheduleApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/release-schedules")
@RequiredArgsConstructor
public class ReleaseScheduleController {

    private final ReleaseScheduleApplicationService scheduleService;

    @GetMapping
    public ResponseEntity<List<ReleaseScheduleDto>> getSchedules(
            @RequestParam(name = "month", required = false) Integer month,
            @RequestParam(name = "year", required = false) Integer year,
            @RequestParam(name = "publisher", required = false) String publisher,
            @RequestParam(name = "hasBook", required = false) Boolean hasBook
    ) {
        return ResponseEntity.ok(scheduleService.getSchedules(month, year, publisher, hasBook));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReleaseScheduleDto> getScheduleById(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(scheduleService.getScheduleById(id));
    }

    @GetMapping("/publishers")
    public ResponseEntity<List<String>> getPublishers() {
        return ResponseEntity.ok(scheduleService.getPublishers());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ReleaseScheduleDto> createSchedule(
            @Valid @RequestBody CreateReleaseScheduleRequest request
    ) {
        ReleaseScheduleDto created = scheduleService.createSchedule(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ReleaseScheduleDto> updateSchedule(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateReleaseScheduleRequest request
    ) {
        return ResponseEntity.ok(scheduleService.updateSchedule(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<Void> deleteSchedule(@PathVariable("id") UUID id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }
}
