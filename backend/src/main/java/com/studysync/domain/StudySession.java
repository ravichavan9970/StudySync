package com.studysync.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.util.UUID;

@Entity @Table(name="study_sessions", indexes=@Index(name="idx_sessions_user_started",columnList="user_id,started_at"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StudySession {
  @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
  @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id") private User user;
  @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="task_id") private Task task;
  @Column(length=100) private String subject;
  @Column(nullable=false) private int plannedMinutes;
  @Column(nullable=false) private int completedMinutes;
  @Column(nullable=false) @Builder.Default private boolean completed=false;
  @Column(nullable=false) private Instant startedAt;
  private Instant endedAt;
}
