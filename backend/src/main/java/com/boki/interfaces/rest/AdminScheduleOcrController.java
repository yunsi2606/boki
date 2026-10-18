package com.boki.interfaces.rest;

import com.boki.application.dto.schedule.BatchCreateScheduleRequest;
import com.boki.application.dto.schedule.OcrScheduleScanResponse;
import com.boki.application.dto.schedule.ReleaseScheduleDto;
import com.boki.application.service.ReleaseScheduleApplicationService;
import com.boki.application.service.ScheduleOcrService;
import com.boki.application.service.ScheduleTextParsingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/release-schedules")
@RequiredArgsConstructor
public class AdminScheduleOcrController {

    private final ScheduleOcrService scheduleOcrService;
    private final ScheduleTextParsingService scheduleTextParsingService;
    private final ReleaseScheduleApplicationService scheduleService;

    @PostMapping(value = "/ocr-scan", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<OcrScheduleScanResponse> scanScheduleImage(
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "publisher", required = false) String publisher,
            @RequestParam(value = "apiKey", required = false) String apiKey
    ) throws IOException {
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng tải lên tệp ảnh hợp lệ");
        }

        String mimeType = image.getContentType() != null ? image.getContentType() : "image/jpeg";
        OcrScheduleScanResponse response = scheduleOcrService.parseScheduleImage(
                image.getBytes(), mimeType, publisher, apiKey);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/parse-text")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<Map<String, Object>> parseScheduleText(
            @RequestBody Map<String, String> payload
    ) {
        String text = payload != null ? payload.get("text") : null;
        String apiKey = payload != null ? payload.get("apiKey") : null;
        Map<String, Object> result = scheduleTextParsingService.parseScheduleText(text, apiKey);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/batch")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<List<ReleaseScheduleDto>> batchCreateSchedules(
            @Valid @RequestBody BatchCreateScheduleRequest request
    ) {
        List<ReleaseScheduleDto> created = scheduleService.batchCreateSchedules(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
