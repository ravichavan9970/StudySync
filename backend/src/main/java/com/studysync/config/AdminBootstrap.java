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
@Configuration @RequiredArgsConstructor
public class AdminBootstrap {
 private final UserRepository users;private final PasswordEncoder encoder;
 @Bean ApplicationRunner createConfiguredAdmin(@Value("${app.admin.email:}") String email,@Value("${app.admin.password:}") String password){return args->{if(!email.isBlank()&&!password.isBlank()&&!users.existsByEmailIgnoreCase(email))users.save(User.builder().name("StudySync Admin").email(email.trim().toLowerCase()).password(encoder.encode(password)).role(Role.ADMIN).build());};}
}
