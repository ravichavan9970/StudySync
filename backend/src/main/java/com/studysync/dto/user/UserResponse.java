package com.studysync.dto.user;
import com.studysync.domain.User;
import java.util.UUID;
public record UserResponse(UUID id,String name,String email,String role,String profilePictureUrl,boolean darkMode,String theme,int streakCount,int productivityScore){public static UserResponse from(User u){return new UserResponse(u.getId(),u.getName(),u.getEmail(),u.getRole().name(),u.getProfilePictureUrl(),u.isDarkMode(),u.getTheme(),u.getStreakCount(),u.getProductivityScore());}}
