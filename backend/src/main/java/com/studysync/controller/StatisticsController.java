package com.studysync.controller;
import com.studysync.dto.statistics.StatisticsResponse;
import com.studysync.service.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/statistics")
public class StatisticsController extends BaseController {private final DashboardService dashboard;public StatisticsController(CurrentUserService c,DashboardService d){super(c);dashboard=d;}@GetMapping public StatisticsResponse get(Authentication a,@RequestParam(defaultValue="weekly") String range){return dashboard.statistics(me(a),range);}}
