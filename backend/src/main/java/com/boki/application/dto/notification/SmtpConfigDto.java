package com.boki.application.dto.notification;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SmtpConfigDto {

    @NotBlank(message = "SMTP Host không được để trống")
    private String host;

    @NotNull(message = "SMTP Port không được để trống")
    private Integer port;

    private String username;
    private String password; // Will be empty on get unless updating
    private Boolean passwordConfigured; // True if DB has a non-empty password

    private Boolean authEnabled;
    private Boolean starttlsEnabled;

    @NotBlank(message = "From Name không được để trống")
    private String fromName;

    @NotBlank(message = "From Email không được để trống")
    private String fromEmail;

    private String replyTo;

    private Integer maxRatePerMinute;

    private Boolean isEnabled;
}
