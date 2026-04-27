package com.project.microstart.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @GetMapping("/profile")
    public ResponseEntity<String> adminProfile(Authentication authentication) {
        return ResponseEntity.ok("ADMIN profile accessed");
    }
}