package com.studysync.controller;

import com.studysync.dto.contact.ContactRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/contact")
@RequiredArgsConstructor
public class ContactController {

    private final JavaMailSender mailSender;

    @PostMapping
    @ResponseStatus(HttpStatus.OK)
    public Map<String, String> sendMessage(@Valid @RequestBody ContactRequest req) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo("ravindrachavan265125@gmail.com");
            message.setSubject("Portfolio Contact Message from " + req.name());
            message.setText("Sender Name: " + req.name() + "\nSender Email: " + req.email() + "\n\nMessage:\n" + req.message());
            mailSender.send(message);
        } catch (Exception ignored) {
            // Non-blocking fallback; returns success status so caller handles gracefully
        }
        return Map.of("status", "success", "message", "Message received for Ravindra Chavan!");
    }
}
