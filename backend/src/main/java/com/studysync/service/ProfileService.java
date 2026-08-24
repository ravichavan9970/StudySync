package com.studysync.service;

import com.studysync.domain.User;
import com.studysync.dto.user.*;
import com.studysync.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfileService {
    private final UserRepository users;

    @Transactional(readOnly = true)
    public UserResponse get(User u) {
        return UserResponse.from(u);
    }

    public UserResponse update(User u, UserProfileRequest r) {
        if (r.name() != null && !r.name().isBlank()) {
            u.setName(r.name().trim());
        }
        u.setProfilePictureUrl(r.profilePictureUrl());
        if (r.avatarBadge() != null && !r.avatarBadge().isBlank()) {
            u.setAvatarBadge(r.avatarBadge());
        }
        u.setDarkMode(r.darkMode());
        u.setTheme(r.theme() == null || r.theme().isBlank() ? "violet" : r.theme());
        return UserResponse.from(users.save(u));
    }
}
