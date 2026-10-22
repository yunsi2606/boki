package com.boki.application.dto.giveaway;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GiveawaySubmitEntryRequest {

    @NotBlank(message = "Họ và tên không được để trống")
    @Size(max = 255, message = "Họ và tên không vượt quá 255 ký tự")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Size(max = 255, message = "Email không vượt quá 255 ký tự")
    private String email;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$", message = "Số điện thoại không hợp lệ (10-11 chữ số)")
    private String phone;

    @NotNull(message = "Vui lòng chọn con số may mắn (100 - 999)")
    @Min(value = 100, message = "Con số may mắn phải từ 100 đến 999")
    @Max(value = 999, message = "Con số may mắn phải từ 100 đến 999")
    private Integer luckyNumber;

    @Size(max = 1000, message = "Lời nhắn không vượt quá 1000 ký tự")
    private String comment;
}
