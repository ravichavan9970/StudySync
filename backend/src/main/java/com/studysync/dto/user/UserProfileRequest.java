package com.studysync.dto.user;

import jakarta.validation.constraints.*;

public record UserProfileRequest(
    @NotBlank @Size(max = 80) String name,
    @Size(max = 5000000) String profilePictureUrl,
    String avatarBadge,
    boolean darkMode,
    @Size(max = 30) String theme
) {}
