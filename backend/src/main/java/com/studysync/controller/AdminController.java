package com.studysync.controller;

import com.studysync.domain.*;
import com.studysync.dto.admin.AdminDashboardResponse;
import com.studysync.dto.user.UserResponse;
import com.studysync.exception.BadRequestException;
import com.studysync.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {
    private final UserRepository users;
    private final TaskRepository tasks;
    private final NoteRepository notes;
    private final CategoryRepository categories;
    private final StudySessionRepository sessions;
    private final PasswordResetTokenRepository resetTokens;
    private final StatisticRepository statistics;

    @Value("${app.admin.passcode:StudySync#*&Master2026!Admin}")
    private String adminPasscode;

    @PostMapping("/verify-passcode")
    public ResponseEntity<Map<String, Object>> verifyPasscode(@RequestBody Map<String, String> body) {
        String entered = body.getOrDefault("passcode", "");
        if (adminPasscode.equals(entered.trim())) {
            return ResponseEntity.ok(Map.of("valid", true, "message", "Admin authentication verified."));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("valid", false, "message", "Invalid admin master passcode."));
    }

    @GetMapping("/users")
    public Page<UserResponse> users(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size) {
        return users.findAll(PageRequest.of(Math.max(0, page), Math.max(1, Math.min(100, size)), Sort.by("createdAt").descending())).map(UserResponse::from);
    }

    @Transactional
    @DeleteMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        User u = users.findById(id).orElseThrow(() -> new BadRequestException("User not found"));
        if (u.getRole() == Role.ADMIN) throw new BadRequestException("Admin accounts cannot be deleted through this endpoint");

        // Cascade delete child entities to ensure referential integrity
        resetTokens.deleteByUser(u);
        sessions.deleteByUser(u);
        tasks.deleteByUser(u);
        notes.deleteByUser(u);
        categories.deleteByUser(u);
        statistics.deleteByUser(u);

        // Delete user record from database permanently
        users.delete(u);
        users.flush();
    }

    @Transactional
    @DeleteMapping("/users/all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAllUsers() {
        resetTokens.deleteAll();
        sessions.deleteAll();
        tasks.deleteAll();
        notes.deleteAll();
        categories.deleteAll();
        statistics.deleteAll();

        // Delete all non-ADMIN accounts permanently
        List<User> toDelete = users.findAll().stream()
            .filter(u -> u.getRole() != Role.ADMIN)
            .toList();
        users.deleteAll(toDelete);
        users.flush();
    }

    @GetMapping("/dashboard")
    public AdminDashboardResponse dashboard() {
        return new AdminDashboardResponse(
            users.count(),
            users.findAll().stream().filter(User::isEnabled).count(),
            tasks.count(),
            tasks.findAll().stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count()
        );
    }

    @GetMapping("/system/stats")
    public Map<String, Object> systemStats() {
        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory() / (1024 * 1024);
        long freeMemory = runtime.freeMemory() / (1024 * 1024);
        long usedMemory = totalMemory - freeMemory;

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", users.count());
        stats.put("activeUsers", users.findAll().stream().filter(User::isEnabled).count());
        stats.put("totalTasks", tasks.count());
        stats.put("completedTasks", tasks.findAll().stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count());
        stats.put("totalNotes", notes.count());
        stats.put("totalCategories", categories.count());
        stats.put("totalSessions", sessions.count());
        stats.put("usedMemoryMb", usedMemory);
        stats.put("totalMemoryMb", totalMemory);
        stats.put("serverStatus", "ONLINE");
        stats.put("cloudEnvironment", "RENDER_PRODUCTION_READY");
        return stats;
    }
}
