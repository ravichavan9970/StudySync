package com.studysync.repository;
import com.studysync.domain.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.*;
import java.util.*;
public interface TaskRepository extends JpaRepository<Task,UUID>{
  @EntityGraph(attributePaths="category")
  Optional<Task> findByIdAndUser(UUID id,User user);
  @EntityGraph(attributePaths="category")
  @Query("select t from Task t where t.user=:user and (:status is null or t.status=:status) and (:categoryId is null or t.category.id=:categoryId) and (:q is null or lower(t.title) like lower(concat('%',:q,'%')) or lower(coalesce(t.description,'')) like lower(concat('%',:q,'%')))")
  Page<Task> search(@Param("user") User user,@Param("status") TaskStatus status,@Param("categoryId") UUID categoryId,@Param("q") String q,Pageable pageable);
  long countByUserAndStatus(User user,TaskStatus status);
  long countByUserAndStatusAndCompletedAtBetween(User user,TaskStatus status,Instant from,Instant to);
  List<Task> findByUserAndStatusAndDueDateLessThan(User user,TaskStatus status,LocalDate date);
  List<Task> findByUserAndStatusAndDueDate(User user,TaskStatus status,LocalDate date);
  @EntityGraph(attributePaths="category")
  List<Task> findByUserAndDueDateBetweenOrderByDueDateAsc(User user,LocalDate from,LocalDate to);
  void deleteByUser(User user);
}
