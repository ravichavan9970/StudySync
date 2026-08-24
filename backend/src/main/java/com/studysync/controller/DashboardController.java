package com.studysync.controller;
import com.studysync.dto.dashboard.DashboardResponse;
import com.studysync.service.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/dashboard")
public class DashboardController extends BaseController {private final DashboardService dashboard;public DashboardController(CurrentUserService c,DashboardService d){super(c);dashboard=d;}@GetMapping public DashboardResponse get(Authentication a){return dashboard.dashboard(me(a));}}
