package com.studysync.repository;
import com.studysync.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.*;
import java.util.*;
public interface StudySessionRepository extends JpaRepository<StudySession,UUID>{
 @Query("select coalesce(sum(s.completedMinutes),0) from StudySession s where s.user=:user and s.startedAt between :from and :to") Integer sumMinutes(@Param("user") User user,@Param("from") Instant from,@Param("to") Instant to);
 List<StudySession> findTop20ByUserOrderByStartedAtDesc(User user);
}
