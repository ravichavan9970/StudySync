package com.studysync.dto.statistics;
import java.time.LocalDate;
import java.util.List;
public record StatisticsResponse(String range,long completedTasks,long pendingTasks,long focusMinutes,List<DataPoint> productivity){public record DataPoint(LocalDate date,int completedTasks,int focusMinutes,int productivityScore){}}
