package com.studysync.dto.dashboard;
import java.util.*;
public record DashboardResponse(String greeting,String name,long completedToday,long dueToday,long pendingTasks,long weeklyFocusMinutes,long monthlyFocusMinutes,int productivityScore,int streakCount,List<String> alerts){}
