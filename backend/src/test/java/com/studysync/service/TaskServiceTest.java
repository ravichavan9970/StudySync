package com.studysync.service;

import com.studysync.domain.*;
import com.studysync.dto.task.*;
import com.studysync.repository.TaskRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.LocalDate;
import java.util.UUID;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {
  @Mock private TaskRepository tasks;
  @Mock private CategoryService categories;
  @InjectMocks private TaskService service;
  private User user;
  @BeforeEach void setUp(){user=User.builder().id(UUID.randomUUID()).email("student@example.com").name("Student").password("hash").build();}
  @Test void createsTaskForAuthenticatedUser(){TaskRequest request=new TaskRequest("Prepare lab report","Add results",Priority.HIGH,LocalDate.now().plusDays(1),null);when(tasks.save(any(Task.class))).thenAnswer(call-> {Task task=call.getArgument(0);task.setId(UUID.randomUUID());return task;});TaskResponse created=service.create(user,request);assertThat(created.title()).isEqualTo("Prepare lab report");assertThat(created.priority()).isEqualTo("HIGH");verify(tasks).save(argThat(task->task.getUser()==user&&task.getStatus()==TaskStatus.PENDING));}
  @Test void marksOwnedTaskComplete(){UUID id=UUID.randomUUID();Task task=Task.builder().id(id).user(user).title("Read chapter").priority(Priority.MEDIUM).status(TaskStatus.PENDING).build();when(tasks.findByIdAndUser(id,user)).thenReturn(java.util.Optional.of(task));when(tasks.save(task)).thenReturn(task);TaskResponse updated=service.complete(user,id,true);assertThat(updated.status()).isEqualTo("COMPLETED");assertThat(task.getCompletedAt()).isNotNull();}
}
