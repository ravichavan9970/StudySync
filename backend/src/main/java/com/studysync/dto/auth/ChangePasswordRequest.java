package com.studysync.dto.auth;
import jakarta.validation.constraints.*;
public record ChangePasswordRequest(@NotBlank String currentPassword,@NotBlank @Size(min=8,max=72) String newPassword){}
