package com.boki.application.dto.notification;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComposeBroadcastRequest {

    @NotBlank(message = "Tiêu đề không được để trống")
    private String subject;

    @NotBlank(message = "Nội dung không được để trống")
    private String content;

    @NotBlank(message = "Nhóm người nhận không được để trống")
    private String targetGroup; // TEST_ONLY, SERIES_SUBSCRIBERS, ALL_DIGEST_SUBSCRIBERS

    private String targetId;    // seriesSlug if SERIES_SUBSCRIBERS

    private String testEmail;   // if TEST_ONLY
}
