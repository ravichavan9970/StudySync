package com.studysync.security;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.stereotype.Component;
import java.io.IOException;
@Component @RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
 private final JwtService jwt; private final CustomUserDetailsService userDetailsService;
 protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain)throws ServletException,IOException{String header=request.getHeader(HttpHeaders.AUTHORIZATION);if(header==null||!header.startsWith("Bearer ")){chain.doFilter(request,response);return;}String token=header.substring(7);try{String email=jwt.extractUsername(token);if(email!=null&&SecurityContextHolder.getContext().getAuthentication()==null){UserDetails details=userDetailsService.loadUserByUsername(email);if(jwt.isValid(token,details)){var auth=new UsernamePasswordAuthenticationToken(details,null,details.getAuthorities());auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));SecurityContextHolder.getContext().setAuthentication(auth);}}}catch(Exception ignored){}chain.doFilter(request,response);}
}
