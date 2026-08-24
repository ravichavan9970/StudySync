package com.studysync.repository;
import com.studysync.domain.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;
public interface NoteRepository extends JpaRepository<Note,UUID>{
 @EntityGraph(attributePaths="category")
 Optional<Note> findByIdAndUser(UUID id,User user);
 @EntityGraph(attributePaths="category")
 @Query("select n from Note n where n.user=:user and n.archived=:archived and (:q is null or lower(n.title) like lower(concat('%',:q,'%')))")
 Page<Note> search(@Param("user") User user,@Param("archived") boolean archived,@Param("q") String q,Pageable page);
 void deleteByUser(User user);
}
