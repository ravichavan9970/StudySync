package com.studysync.config;

import com.studysync.domain.Role;
import com.studysync.domain.User;
import com.studysync.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class AdminBootstrap {
    private final UserRepository users;
    private final PasswordEncoder encoder;

    @Bean
    ApplicationRunner createConfiguredAdmin(
        @Value("${app.admin.email:Ravi@7447}") String email,
        @Value("${app.admin.password:StudySync#*&Master2026!Admin}") String password
    ) {
        return args -> {
            String adminId = email != null && !email.isBlank() ? email.trim() : "Ravi@7447";
            String adminPass = password != null && !password.isBlank() ? password : "StudySync#*&Master2026!Admin";

            if (!users.existsByEmailIgnoreCase(adminId)) {
                users.save(
                    User.builder()
                        .name("Root Administrator")
                        .email(adminId.toLowerCase())
                        .password(encoder.encode(adminPass))
                        .role(Role.ADMIN)
                        .avatarBadge("🛡️")
                        .build()
                );
            }
        };
    }
}
