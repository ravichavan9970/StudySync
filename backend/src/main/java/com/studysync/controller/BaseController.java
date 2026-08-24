package com.studysync.controller;
import com.studysync.domain.User;
import com.studysync.service.CurrentUserService;
import org.springframework.security.core.Authentication;
public abstract class BaseController {protected final CurrentUserService currentUsers;protected BaseController(CurrentUserService currentUsers){this.currentUsers=currentUsers;}protected User me(Authentication auth){return currentUsers.get(auth.getName());}}
