package com.boki.application.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OcrScheduleScanResponse {
    private String detectedPublisher;
    private Integer year;
    private Integer month;
    private int totalDetected;
    @Builder.Default
    private List<OcrParsedBookItemDto> items = new ArrayList<>();
}
