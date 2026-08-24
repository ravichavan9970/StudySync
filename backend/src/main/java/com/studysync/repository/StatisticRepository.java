package com.studysync.repository;
import com.studysync.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.*;
import java.util.*;
public interface StatisticRepository extends JpaRepository<Statistic,UUID>{
 List<Statistic> findByUserAndDateBetweenOrderByDateAsc(User user,LocalDate from,LocalDate to);
 Optional<Statistic> findByUserAndDate(User user,LocalDate date);
 void deleteByUser(User user);
}
