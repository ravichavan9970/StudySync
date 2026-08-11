package com.studysync.repository;
import com.studysync.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken,UUID>{ Optional<PasswordResetToken> findByToken(String token); void deleteByUser(User user); }
