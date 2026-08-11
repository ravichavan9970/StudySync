package com.studysync.dto.session;
import com.studysync.domain.StudySession;
import java.time.*;
import java.util.UUID;
public record StudySessionResponse(UUID id,UUID taskId,String subject,int plannedMinutes,int completedMinutes,boolean completed,Instant startedAt,Instant endedAt){public static StudySessionResponse from(StudySession s){return new StudySessionResponse(s.getId(),s.getTask()==null?null:s.getTask().getId(),s.getSubject(),s.getPlannedMinutes(),s.getCompletedMinutes(),s.isCompleted(),s.getStartedAt(),s.getEndedAt());}}
