package com.studysync.service;
import com.studysync.domain.User;
import com.studysync.exception.NotFoundException;
import com.studysync.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
@Service @RequiredArgsConstructor
public class CurrentUserService { private final UserRepository users; public User get(String email){return users.findByEmailIgnoreCase(email).orElseThrow(()->new NotFoundException("User not found"));} }
