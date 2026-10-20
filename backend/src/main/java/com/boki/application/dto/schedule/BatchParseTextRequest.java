package com.boki.application.dto.schedule;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchParseTextRequest {
    @NotBlank(message = "Nội dung văn bản không được để trống")
    private String text;
    private String publisher;
    private Integer month;
    private Integer year;
    private String apiKey;
}
