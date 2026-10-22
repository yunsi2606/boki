package com.boki.application.dto.giveaway;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DrawGiveawayRequest {

    @NotNull(message = "Số trúng thưởng xổ số không được để trống")
    @Min(value = 100, message = "Số trúng thưởng phải từ 100 đến 999")
    @Max(value = 999, message = "Số trúng thưởng phải từ 100 đến 999")
    private Integer winningNumber;

    @Builder.Default
    private Boolean sendNotificationEmails = true;
}
