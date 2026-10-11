package com.boki.application.dto.rbac;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record SaveRoleRequest(
        @NotBlank(message = "Mã vai trò không được để trống")
        @Size(max = 50, message = "Mã vai trò tối đa 50 ký tự")
        String code,

        @NotBlank(message = "Tên vai trò không được để trống")
        @Size(max = 100, message = "Tên vai trò tối đa 100 ký tự")
        String name,

        @Size(max = 255, message = "Mô tả tối đa 255 ký tự")
        String description,

        String color,

        List<String> permissionCodes
) {}
