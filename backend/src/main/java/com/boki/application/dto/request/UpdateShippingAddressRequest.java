package com.boki.application.dto.request;

import jakarta.validation.constraints.NotBlank;

public record UpdateShippingAddressRequest(
        @NotBlank(message = "Họ và tên không được để trống")
        String fullName,

        @NotBlank(message = "Số điện thoại không được để trống")
        String phoneNumber,

        @NotBlank(message = "Tỉnh/Thành phố không được để trống")
        String province,

        Integer provinceCode,

        @NotBlank(message = "Quận/Huyện không được để trống")
        String district,

        Integer districtCode,

        @NotBlank(message = "Phường/Xã không được để trống")
        String ward,

        Integer wardCode,

        @NotBlank(message = "Địa chỉ chi tiết không được để trống")
        String streetAddress,

        String note
) {}
