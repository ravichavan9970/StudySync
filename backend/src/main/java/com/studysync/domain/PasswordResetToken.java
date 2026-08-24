package com.studysync.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name="password_reset_tokens", indexes=@Index(name="idx_reset_token",columnList="token",unique=true))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PasswordResetToken {
  @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
  @OneToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id",unique=true) private User user;
  @Column(nullable=false,unique=true,length=100) private String token;
  @Column(nullable=false) private Instant expiresAt;
}
