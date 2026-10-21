package com.boki.application.dto.notification;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleSubscriptionRequest {

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Địa chỉ email không đúng định dạng")
    private String email;

    @NotEmpty(message = "Vui lòng chọn ít nhất một loại thông báo")
    private List<String> subscriptionTypes; // SERIES, VOLUME, VAULT, DELAY_ALERT, WEEKLY_DIGEST

    private String targetId;   // seriesSlug or scheduleId

    private String targetName; // Tên tác phẩm hoặc tên tập
}
