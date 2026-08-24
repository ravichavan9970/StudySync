package com.studysync.controller;
import com.studysync.domain.TaskStatus;
import com.studysync.dto.task.*;
import com.studysync.service.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/tasks")
public class TaskController extends BaseController {private final TaskService tasks;public TaskController(CurrentUserService c,TaskService s){super(c);tasks=s;}
 @GetMapping public Page<TaskResponse> list(Authentication a,@RequestParam(required=false) TaskStatus status,@RequestParam(required=false) UUID categoryId,@RequestParam(required=false) String q,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size,@RequestParam(defaultValue="dueDate") String sort){return tasks.list(me(a),status,categoryId,q,Math.max(page,0),Math.max(size,1),sort);}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public TaskResponse create(Authentication a,@Valid @RequestBody TaskRequest r){return tasks.create(me(a),r);}
 @PutMapping("/{id}") public TaskResponse update(Authentication a,@PathVariable UUID id,@Valid @RequestBody TaskRequest r){return tasks.update(me(a),id,r);}
 @PatchMapping("/{id}/complete") public TaskResponse complete(Authentication a,@PathVariable UUID id,@RequestParam(defaultValue="true") boolean completed){return tasks.complete(me(a),id,completed);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(Authentication a,@PathVariable UUID id){tasks.delete(me(a),id);}
}
