package com.studysync.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name="notes", indexes={@Index(name="idx_notes_user_state",columnList="user_id,archived,pinned")})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Note {
  @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
  @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="user_id") private User user;
  @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="category_id") private Category category;
  @Column(nullable=false,length=160) private String title;
  // Keep rich note content in MySQL TEXT without mapping it as a CLOB.
  // This permits case-insensitive searching with JPQL lower(...).
  @JdbcTypeCode(SqlTypes.LONGVARCHAR)
  @Column(columnDefinition="TEXT") private String content;
  @Column(nullable=false) @Builder.Default private boolean pinned=false;
  @Column(nullable=false) @Builder.Default private boolean archived=false;
  @Column(nullable=false,updatable=false) private Instant createdAt;
  @Column(nullable=false) private Instant updatedAt;
  @PrePersist void create(){createdAt=Instant.now();updatedAt=createdAt;}
  @PreUpdate void update(){updatedAt=Instant.now();}
}
