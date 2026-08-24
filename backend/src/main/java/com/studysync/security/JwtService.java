package com.studysync.security;

import com.studysync.domain.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.*;

@Service
public class JwtService {
  private final SecretKey key; private final Duration expiration;
  public JwtService(@Value("${app.jwt.secret}") String secret,@Value("${app.jwt.expiration-minutes}") long minutes){if(secret.length()<32)throw new IllegalArgumentException("JWT secret must be at least 32 characters");key=Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));expiration=Duration.ofMinutes(minutes);}
  public String generateToken(User user){Instant now=Instant.now();return Jwts.builder().subject(user.getEmail()).claim("role",user.getRole().name()).issuedAt(Date.from(now)).expiration(Date.from(now.plus(expiration))).signWith(key).compact();}
  public String extractUsername(String token){return claims(token).getSubject();}
  public boolean isValid(String token,UserDetails details){try{return details.getUsername().equalsIgnoreCase(extractUsername(token))&&!claims(token).getExpiration().before(new Date());}catch(JwtException e){return false;}}
  private Claims claims(String token){return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();}
}
