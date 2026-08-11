package com.studysync.dto.task;
import com.studysync.domain.Task;
import java.time.*;
import java.util.UUID;
public record TaskResponse(UUID id,String title,String description,String priority,String status,LocalDate dueDate,UUID categoryId,String categoryName,Instant createdAt,Instant completedAt){public static TaskResponse from(Task t){return new TaskResponse(t.getId(),t.getTitle(),t.getDescription(),t.getPriority().name(),t.getStatus().name(),t.getDueDate(),t.getCategory()==null?null:t.getCategory().getId(),t.getCategory()==null?null:t.getCategory().getName(),t.getCreatedAt(),t.getCompletedAt());}}
