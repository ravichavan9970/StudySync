package com.studysync.controller;
import com.studysync.dto.task.TaskResponse;
import com.studysync.service.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;
@RestController @RequestMapping("/study-planner")
public class StudyPlannerController extends BaseController {private final TaskService tasks;public StudyPlannerController(CurrentUserService c,TaskService t){super(c);tasks=t;}@GetMapping public List<TaskResponse> plan(Authentication a,@RequestParam(required=false) LocalDate from,@RequestParam(required=false) LocalDate to){LocalDate start=from==null?LocalDate.now():from;LocalDate end=to==null?start.plusDays(30):to;return tasks.planner(me(a),start,end);}}
