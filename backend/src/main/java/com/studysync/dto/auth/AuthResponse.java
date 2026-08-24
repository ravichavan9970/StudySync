package com.studysync.dto.auth;
import java.util.UUID;
public record AuthResponse(String token,String tokenType,UUID userId,String name,String email,String role){}
