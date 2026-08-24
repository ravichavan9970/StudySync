package com.studysync.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.util.UUID;

@Entity @Table(name="tasks", indexes={@Index(name="idx_tasks_user_due",columnList="user_id,due_date"),@Index(name="idx_tasks_user_status",columnList="user_id,status")})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Task {
  @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
  @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="user_id") private User user;
  @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="category_id") private Category category;
  @Column(nullable=false,length=160) private String title;
  @Column(length=2000) private String description;
  @Enumerated(EnumType.STRING) @Column(nullable=false,length=10) @Builder.Default private Priority priority=Priority.MEDIUM;
  @Enumerated(EnumType.STRING) @Column(nullable=false,length=12) @Builder.Default private TaskStatus status=TaskStatus.PENDING;
  private LocalDate dueDate;
  private Instant completedAt;
  @Column(nullable=false,updatable=false) private Instant createdAt;
  @Column(nullable=false) private Instant updatedAt;
  @PrePersist void create(){createdAt=Instant.now();updatedAt=createdAt;}
  @PreUpdate void update(){updatedAt=Instant.now();}
}
