package com.studysync.dto.auth;
import jakarta.validation.constraints.*;
public record ForgotPasswordRequest(@NotBlank @Email String email){}
