package com.studysync.service;

import com.studysync.domain.*;
import com.studysync.dto.auth.*;
import com.studysync.exception.BadRequestException;
import com.studysync.repository.*;
import com.studysync.security.JwtService;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
  @Mock private UserRepository users;
  @Mock private PasswordResetTokenRepository resetTokens;
  @Mock private PasswordEncoder encoder;
  @Mock private AuthenticationManager authenticationManager;
  @Mock private JwtService jwt;
  @Mock private JavaMailSender mailSender;

  @InjectMocks private AuthService authService;

  @Test
  void registersNewUserSuccessfully() {
    RegisterRequest request = new RegisterRequest("Alice", "alice@example.com", "password123");
    when(users.existsByEmailIgnoreCase("alice@example.com")).thenReturn(false);
    when(encoder.encode("password123")).thenReturn("encoded_pass");
    when(users.save(any(User.class))).thenAnswer(i -> {
      User u = i.getArgument(0);
      u.setId(UUID.randomUUID());
      return u;
    });
    when(jwt.generateToken(any(User.class))).thenReturn("fake_token");

    AuthResponse response = authService.register(request);

    assertThat(response.token()).isEqualTo("fake_token");
    assertThat(response.name()).isEqualTo("Alice");
    verify(users).save(any(User.class));
  }

  @Test
  void throwsExceptionWhenEmailAlreadyExists() {
    RegisterRequest request = new RegisterRequest("Alice", "alice@example.com", "password123");
    when(users.existsByEmailIgnoreCase("alice@example.com")).thenReturn(true);

    assertThatThrownBy(() -> authService.register(request))
        .isInstanceOf(BadRequestException.class)
        .hasMessageContaining("already exists");
  }
}
