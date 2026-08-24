package com.studysync.service;
import com.studysync.domain.*;
import com.studysync.dto.session.*;
import com.studysync.exception.NotFoundException;
import com.studysync.repository.StudySessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;
@Service @RequiredArgsConstructor
public class StudySessionService {private final StudySessionRepository sessions;private final TaskService tasks;
 @Transactional
 public StudySessionResponse create(User u,StudySessionRequest r){StudySession s=StudySession.builder().user(u).task(r.taskId()==null?null:tasks.get(u,r.taskId())).subject(r.subject()).plannedMinutes(r.plannedMinutes()).completedMinutes(r.completedMinutes()).completed(r.completed()).startedAt(Instant.now()).endedAt(r.completed()?Instant.now():null).build();return StudySessionResponse.from(sessions.save(s));}
 @Transactional
 public StudySessionResponse finish(User u,UUID id,StudySessionRequest r){StudySession s=sessions.findById(id).filter(x->x.getUser().getId().equals(u.getId())).orElseThrow(()->new NotFoundException("Study session not found"));s.setCompletedMinutes(r.completedMinutes());s.setCompleted(r.completed());s.setEndedAt(Instant.now());return StudySessionResponse.from(sessions.save(s));}
 @Transactional(readOnly=true)
 public List<StudySessionResponse> history(User u){return sessions.findTop20ByUserOrderByStartedAtDesc(u).stream().map(StudySessionResponse::from).toList();}
}
