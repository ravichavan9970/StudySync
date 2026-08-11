package com.studysync.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.util.UUID;

@Entity @Table(name="users", indexes={@Index(name="idx_users_email", columnList="email", unique=true)})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
  @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
  @Column(nullable=false, length=80) private String name;
  @Column(nullable=false, unique=true, length=150) private String email;
  @Column(nullable=false) private String password;
  @Enumerated(EnumType.STRING) @Column(nullable=false, length=15) @Builder.Default private Role role=Role.USER;
  private String profilePictureUrl;
  @Column(nullable=false) @Builder.Default private boolean darkMode=false;
  @Column(length=30) @Builder.Default private String theme="violet";
  @Column(nullable=false) @Builder.Default private int streakCount=0;
  @Column(nullable=false) @Builder.Default private int productivityScore=0;
  private LocalDate lastActivityDate;
  @Column(nullable=false) @Builder.Default private boolean enabled=true;
  @Column(nullable=false, updatable=false) private Instant createdAt;
  @Column(nullable=false) private Instant updatedAt;
  @PrePersist void onCreate(){createdAt=Instant.now();updatedAt=createdAt;}
  @PreUpdate void onUpdate(){updatedAt=Instant.now();}
}
