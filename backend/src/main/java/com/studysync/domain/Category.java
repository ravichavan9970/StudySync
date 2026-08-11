package com.studysync.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name="categories", uniqueConstraints=@UniqueConstraint(name="uk_category_user_name", columnNames={"user_id","name"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Category {
  @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
  @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="user_id") private User user;
  @Column(nullable=false,length=50) private String name;
  @Column(nullable=false,length=20) @Builder.Default private String color="#7259ef";
  @Column(nullable=false,updatable=false) private Instant createdAt;
  @PrePersist void create(){createdAt=Instant.now();}
}
