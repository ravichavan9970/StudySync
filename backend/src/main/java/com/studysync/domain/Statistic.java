package com.studysync.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity @Table(name="statistics", uniqueConstraints=@UniqueConstraint(name="uk_statistic_user_day",columnNames={"user_id","stat_date"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Statistic {
  @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
  @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id") private User user;
  @Column(name="stat_date",nullable=false) private LocalDate date;
  @Column(nullable=false) private int completedTasks;
  @Column(nullable=false) private int focusMinutes;
  @Column(nullable=false) private int productivityScore;
}
