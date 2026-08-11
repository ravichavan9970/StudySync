package com.studysync.service;
import com.studysync.domain.*;
import com.studysync.dto.task.*;
import com.studysync.exception.NotFoundException;
import com.studysync.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;
@Service @RequiredArgsConstructor
public class TaskService {private final TaskRepository tasks;private final CategoryService categories;
 @Transactional(readOnly=true)
 public Page<TaskResponse> list(User user,TaskStatus status,UUID categoryId,String query,int page,int size,String sort){String safeSort=Set.of("dueDate","createdAt","priority","title").contains(sort)?sort:"dueDate";return tasks.search(user,status,categoryId,query==null||query.isBlank()?null:query.trim(),PageRequest.of(page,Math.min(size,100),Sort.by(Sort.Direction.ASC,safeSort))).map(TaskResponse::from);}
 @Transactional
 public TaskResponse create(User user,TaskRequest req){return TaskResponse.from(tasks.save(apply(new Task(),user,req)));}
 @Transactional
 public TaskResponse update(User user,UUID id,TaskRequest req){return TaskResponse.from(tasks.save(apply(get(user,id),user,req)));}
 @Transactional
 public TaskResponse complete(User user,UUID id,boolean complete){Task task=get(user,id);task.setStatus(complete?TaskStatus.COMPLETED:TaskStatus.PENDING);task.setCompletedAt(complete?Instant.now():null);return TaskResponse.from(tasks.save(task));}
 @Transactional
 public void delete(User user,UUID id){tasks.delete(get(user,id));}
 @Transactional(readOnly=true)
 public List<TaskResponse> planner(User user,LocalDate from,LocalDate to){return tasks.findByUserAndDueDateBetweenOrderByDueDateAsc(user,from,to).stream().map(TaskResponse::from).toList();}
 public Task get(User user,UUID id){return tasks.findByIdAndUser(id,user).orElseThrow(()->new NotFoundException("Task not found"));}
 private Task apply(Task task,User user,TaskRequest req){task.setUser(user);task.setTitle(req.title().trim());task.setDescription(req.description());task.setPriority(req.priority()==null?Priority.MEDIUM:req.priority());task.setDueDate(req.dueDate());task.setCategory(req.categoryId()==null?null:categories.get(user,req.categoryId()));return task;}
}
