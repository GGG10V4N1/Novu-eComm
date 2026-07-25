package com.soft.ecommerce.security.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateEmailRequest {
    @NotNull
    @NotBlank
    private String currentPassword;

    @Email
    @NotBlank
    @NotNull
    private String newEmail;
}
