package com.studysync.dto.session;
import jakarta.validation.constraints.*;
import java.util.UUID;
public record StudySessionRequest(UUID taskId,@Size(max=100) String subject,@Min(1) @Max(240) int plannedMinutes,@Min(0) @Max(1440) int completedMinutes,boolean completed){}
