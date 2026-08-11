package com.studysync.dto.task;
import com.studysync.domain.Priority;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.UUID;
public record TaskRequest(@NotBlank @Size(max=160) String title,@Size(max=2000) String description,Priority priority,LocalDate dueDate,UUID categoryId){}
