package com.studysync.service;
import com.studysync.domain.*;
import com.studysync.dto.dashboard.DashboardResponse;
import com.studysync.dto.statistics.StatisticsResponse;
import com.studysync.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;
@Service @RequiredArgsConstructor
public class DashboardService {
 private final TaskRepository tasks;private final StudySessionRepository sessions;private final StatisticRepository statistics;private final UserRepository users;
 @Transactional
 public DashboardResponse dashboard(User u){LocalDate today=LocalDate.now();Instant start=today.atStartOfDay(ZoneOffset.UTC).toInstant(),tomorrow=start.plus(Duration.ofDays(1));long completed=tasks.countByUserAndStatusAndCompletedAtBetween(u,TaskStatus.COMPLETED,start,tomorrow);long due=tasks.findByUserAndStatusAndDueDate(u,TaskStatus.PENDING,today).size();long pending=tasks.countByUserAndStatus(u,TaskStatus.PENDING);int weekly=minutes(u,start.minus(Duration.ofDays(6)),tomorrow),monthly=minutes(u,start.minus(Duration.ofDays(29)),tomorrow);int score=(int)Math.min(100,completed*20+weekly/10);updateActivity(u,score);recordDailyStatistic(u);List<String>alerts=new ArrayList<>();if(due>0)alerts.add(due+" task(s) are due today");long overdue=tasks.findByUserAndStatusAndDueDateLessThan(u,TaskStatus.PENDING,today).size();if(overdue>0)alerts.add(overdue+" task(s) are overdue");return new DashboardResponse(greeting()+", "+u.getName(),u.getName(),completed,due,pending,weekly,monthly,u.getProductivityScore(),u.getStreakCount(),alerts);}
 @Transactional(readOnly=true)
 public StatisticsResponse statistics(User u,String range){int days="monthly".equalsIgnoreCase(range)?30:"weekly".equalsIgnoreCase(range)?7:1;LocalDate today=LocalDate.now();Instant end=today.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant(),from=end.minus(Duration.ofDays(days));long completed=tasks.countByUserAndStatusAndCompletedAtBetween(u,TaskStatus.COMPLETED,from,end);int focus=minutes(u,from,end);long pending=tasks.countByUserAndStatus(u,TaskStatus.PENDING);List<Statistic> stored=statistics.findByUserAndDateBetweenOrderByDateAsc(u,today.minusDays(days-1),today);Map<LocalDate,Statistic> byDate=new HashMap<>();stored.forEach(s->byDate.put(s.getDate(),s));List<StatisticsResponse.DataPoint> points=new ArrayList<>();for(int i=days-1;i>=0;i--){LocalDate d=today.minusDays(i);Statistic s=byDate.get(d);if(s!=null){points.add(new StatisticsResponse.DataPoint(d,s.getCompletedTasks(),s.getFocusMinutes(),s.getProductivityScore()));}else{Instant dayStart=d.atStartOfDay(ZoneOffset.UTC).toInstant(),dayEnd=dayStart.plus(Duration.ofDays(1));int dayCompleted=(int)tasks.countByUserAndStatusAndCompletedAtBetween(u,TaskStatus.COMPLETED,dayStart,dayEnd);int dayFocus=minutes(u,dayStart,dayEnd);int dayScore=(int)Math.min(100,dayCompleted*20+dayFocus/10);points.add(new StatisticsResponse.DataPoint(d,dayCompleted,dayFocus,dayScore));}}return new StatisticsResponse(range,completed,pending,focus,points);}
 @Transactional
 public void recordDailyStatistic(User u){LocalDate today=LocalDate.now();Instant start=today.atStartOfDay(ZoneOffset.UTC).toInstant(),end=start.plus(Duration.ofDays(1));Statistic s=statistics.findByUserAndDate(u,today).orElse(Statistic.builder().user(u).date(today).build());s.setCompletedTasks((int)tasks.countByUserAndStatusAndCompletedAtBetween(u,TaskStatus.COMPLETED,start,end));s.setFocusMinutes(minutes(u,start,end));s.setProductivityScore(u.getProductivityScore());statistics.save(s);}
 private int minutes(User u,Instant from,Instant to){return Optional.ofNullable(sessions.sumMinutes(u,from,to)).orElse(0);} private String greeting(){int h=LocalTime.now().getHour();return h<12?"Good morning":h<18?"Good afternoon":"Good evening";}
 private void updateActivity(User u,int score){LocalDate today=LocalDate.now();if(!today.equals(u.getLastActivityDate())){if(today.minusDays(1).equals(u.getLastActivityDate()))u.setStreakCount(u.getStreakCount()+1);else u.setStreakCount(1);u.setLastActivityDate(today);}u.setProductivityScore(score);users.save(u);}
}
