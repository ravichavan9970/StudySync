package com.studysync.controller;
import com.studysync.domain.*;
import com.studysync.service.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;
@RestController @RequestMapping("/notifications")
public class NotificationController extends BaseController {private final com.studysync.repository.TaskRepository tasks;public NotificationController(CurrentUserService c,com.studysync.repository.TaskRepository r){super(c);tasks=r;}
 @GetMapping public List<Map<String,String>> list(Authentication a){var u=me(a);LocalDate now=LocalDate.now();List<Map<String,String>> result=new ArrayList<>();tasks.findByUserAndStatusAndDueDate(u,TaskStatus.PENDING,now).forEach(t->result.add(Map.of("type","DUE_TODAY","message",t.getTitle()+" is due today")));tasks.findByUserAndStatusAndDueDateLessThan(u,TaskStatus.PENDING,now).forEach(t->result.add(Map.of("type","OVERDUE","message",t.getTitle()+" is overdue")));return result;}
}
