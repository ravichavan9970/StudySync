package com.studysync.controller;
import com.studysync.dto.auth.*;
import com.studysync.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/auth") @RequiredArgsConstructor
public class AuthController {private final AuthService auth;
 @PostMapping("/register") @ResponseStatus(HttpStatus.CREATED) public AuthResponse register(@Valid @RequestBody RegisterRequest r){return auth.register(r);}
 @PostMapping("/login") public AuthResponse login(@Valid @RequestBody LoginRequest r){return auth.login(r);}
 @PostMapping("/logout") @ResponseStatus(HttpStatus.NO_CONTENT) public void logout(){/* JWT is stateless; client deletes its token. */}
 @PostMapping("/forgot-password") @ResponseStatus(HttpStatus.NO_CONTENT) public void forgot(@Valid @RequestBody ForgotPasswordRequest r){auth.forgotPassword(r);}
 @PostMapping("/reset-password") @ResponseStatus(HttpStatus.NO_CONTENT) public void reset(@Valid @RequestBody ResetPasswordRequest r){auth.resetPassword(r);}
}
