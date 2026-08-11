package com.studysync.security;
import com.studysync.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
@Service @RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
 private final UserRepository users;
 public UserDetails loadUserByUsername(String email){var user=users.findByEmailIgnoreCase(email).orElseThrow(()->new UsernameNotFoundException("User not found"));return new org.springframework.security.core.userdetails.User(user.getEmail(),user.getPassword(),user.isEnabled(),true,true,true,java.util.List.of(new SimpleGrantedAuthority("ROLE_"+user.getRole().name())));}
}
