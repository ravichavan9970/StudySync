package com.studysync.service;
import com.studysync.domain.*;
import com.studysync.dto.auth.*;
import com.studysync.exception.*;
import com.studysync.repository.*;
import com.studysync.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.UUID;
@Service @RequiredArgsConstructor @Transactional
public class AuthService {
 private final UserRepository users; private final PasswordResetTokenRepository resetTokens; private final PasswordEncoder encoder; private final AuthenticationManager authenticationManager; private final JwtService jwt; private final JavaMailSender mailSender;
 @Value("${app.frontend-url}") private String frontendUrl; @Value("${app.reset-token-expiration-minutes}") private long resetTokenExpiry;
 public AuthResponse register(RegisterRequest req){if(users.existsByEmailIgnoreCase(req.email()))throw new BadRequestException("An account with this email already exists");User user=users.save(User.builder().name(req.name().trim()).email(req.email().trim().toLowerCase()).password(encoder.encode(req.password())).role(Role.USER).build());return response(user);}
 public AuthResponse login(LoginRequest req){try{authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(req.email(),req.password()));}catch(AuthenticationException ex){throw new BadRequestException("Invalid email or password");}return response(users.findByEmailIgnoreCase(req.email()).orElseThrow(()->new NotFoundException("User not found")));}
 public void forgotPassword(ForgotPasswordRequest req){users.findByEmailIgnoreCase(req.email()).ifPresent(user->{resetTokens.deleteByUser(user);String raw=UUID.randomUUID()+"-"+UUID.randomUUID();resetTokens.save(new PasswordResetToken(null,user,raw,Instant.now().plus(Duration.ofMinutes(resetTokenExpiry))));try{var message=new SimpleMailMessage();message.setTo(user.getEmail());message.setSubject("StudySync password reset");message.setText("Reset your password: "+frontendUrl+"/reset-password.html?token="+raw+"\nThis link expires in "+resetTokenExpiry+" minutes.");mailSender.send(message);}catch(Exception ignored){/* configure SMTP in production; response remains non-enumerating */}});}
 public void resetPassword(ResetPasswordRequest req){var token=resetTokens.findByToken(req.token()).orElseThrow(()->new BadRequestException("Invalid or expired reset token"));if(token.getExpiresAt().isBefore(Instant.now())){resetTokens.delete(token);throw new BadRequestException("Invalid or expired reset token");}token.getUser().setPassword(encoder.encode(req.newPassword()));users.save(token.getUser());resetTokens.delete(token);}
 public void changePassword(String email,ChangePasswordRequest req){User user=users.findByEmailIgnoreCase(email).orElseThrow(()->new NotFoundException("User not found"));if(!encoder.matches(req.currentPassword(),user.getPassword()))throw new BadRequestException("Current password is incorrect");user.setPassword(encoder.encode(req.newPassword()));users.save(user);}
 private AuthResponse response(User user){return new AuthResponse(jwt.generateToken(user),"Bearer",user.getId(),user.getName(),user.getEmail(),user.getRole().name());}
}
