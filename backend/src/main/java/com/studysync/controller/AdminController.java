package com.studysync.controller;
import com.studysync.domain.*;
import com.studysync.dto.admin.AdminDashboardResponse;
import com.studysync.dto.user.UserResponse;
import com.studysync.exception.BadRequestException;
import com.studysync.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/admin") @RequiredArgsConstructor
public class AdminController {private final UserRepository users;private final TaskRepository tasks;
 @GetMapping("/users") public Page<UserResponse> users(@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){return users.findAll(PageRequest.of(Math.max(0,page),Math.max(1,Math.min(100,size)),Sort.by("createdAt").descending())).map(UserResponse::from);}
 @DeleteMapping("/users/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable UUID id){User u=users.findById(id).orElseThrow(()->new BadRequestException("User not found"));if(u.getRole()==Role.ADMIN)throw new BadRequestException("Admin accounts cannot be deleted through this endpoint");users.delete(u);}
 @GetMapping("/dashboard") public AdminDashboardResponse dashboard(){return new AdminDashboardResponse(users.count(),users.findAll().stream().filter(User::isEnabled).count(),tasks.count(),tasks.findAll().stream().filter(t->t.getStatus()==TaskStatus.COMPLETED).count());}
}
