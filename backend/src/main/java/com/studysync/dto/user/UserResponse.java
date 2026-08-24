package com.studysync.dto.user;

import com.studysync.domain.User;
import java.util.UUID;

public record UserResponse(
    UUID id,
    String name,
    String email,
    String role,
    String profilePictureUrl,
    String avatarBadge,
    boolean darkMode,
    String theme,
    int streakCount,
    int productivityScore
) {
    public static UserResponse from(User u) {
        String pic = u.getProfilePictureUrl();
        if (pic != null && (pic.contains("postimg") || pic.isBlank())) {
            pic = null;
        }
        return new UserResponse(
            u.getId(),
            u.getName(),
            u.getEmail(),
            u.getRole() != null ? u.getRole().name() : "USER",
            pic,
            u.getAvatarBadge() != null ? u.getAvatarBadge() : "🎓",
            u.isDarkMode(),
            u.getTheme() != null ? u.getTheme() : "violet",
            u.getStreakCount(),
            u.getProductivityScore()
        );
    }
}
