package com.studysync.dto.user;
import jakarta.validation.constraints.*;
public record UserProfileRequest(@NotBlank @Size(max=80) String name,@Size(max=500) String profilePictureUrl,boolean darkMode,@Size(max=30) String theme){}
