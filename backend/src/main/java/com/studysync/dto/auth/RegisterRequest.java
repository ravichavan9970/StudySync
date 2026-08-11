package com.studysync.dto.auth;
import jakarta.validation.constraints.*;
public record RegisterRequest(@NotBlank @Size(max=80) String name,@NotBlank @Email @Size(max=150) String email,@NotBlank @Size(min=8,max=72) String password){}
