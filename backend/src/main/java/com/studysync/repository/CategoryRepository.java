package com.studysync.repository;
import com.studysync.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface CategoryRepository extends JpaRepository<Category,UUID>{ List<Category> findAllByUserOrderByNameAsc(User user); Optional<Category> findByIdAndUser(UUID id,User user); Optional<Category> findByUserAndNameIgnoreCase(User user,String name); }
