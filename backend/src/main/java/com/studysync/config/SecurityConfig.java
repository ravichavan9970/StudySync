package com.studysync.config;
import com.studysync.security.*;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
@Configuration @EnableWebSecurity @RequiredArgsConstructor
public class SecurityConfig {
 private final JwtAuthenticationFilter jwtFilter; private final CustomUserDetailsService detailsService;
 @Bean PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder();}
 @Bean AuthenticationProvider authenticationProvider(PasswordEncoder encoder){var provider=new DaoAuthenticationProvider(encoder);provider.setUserDetailsService(detailsService);return provider;}
 @Bean AuthenticationManager authenticationManager(AuthenticationConfiguration config)throws Exception{return config.getAuthenticationManager();}
 @Bean SecurityFilterChain filterChain(HttpSecurity http,AuthenticationProvider provider)throws Exception{
   return http
     .csrf(csrf->csrf.disable())
     .cors(cors->{})
     .headers(headers->headers.frameOptions(frame->frame.disable()))
     .sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
     .authenticationProvider(provider)
     .authorizeHttpRequests(a->a
       .requestMatchers("/auth/**","/uploads/**","/contact","/swagger-ui/**","/swagger-ui.html","/api-docs/**","/actuator/health","/h2-console/**","/admin/verify-passcode").permitAll()
       .requestMatchers(HttpMethod.OPTIONS,"/**").permitAll()
       .requestMatchers("/admin/**").hasRole("ADMIN")
       .anyRequest().authenticated())
     .addFilterBefore(jwtFilter,UsernamePasswordAuthenticationFilter.class)
     .build();
 }
}
