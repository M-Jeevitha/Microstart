package com.project.microstart.controller;

import com.project.microstart.entity.User;
import com.project.microstart.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    // Get user profile
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    // Update user profile
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (request.containsKey("fullName")) {
            user.setFullName(request.get("fullName"));
        }
        if (request.containsKey("phone")) {
            user.setPhone(request.get("phone"));
        }
        
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }

    // Update KYC details
    @PutMapping("/kyc")
    public ResponseEntity<?> updateKYC(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (request.containsKey("pan")) {
            user.setPan(request.get("pan"));
        }
        if (request.containsKey("aadhar")) {
            user.setAadhar(request.get("aadhar"));
        }
        if (request.containsKey("incomeRange")) {
            user.setIncomeRange(request.get("incomeRange"));
        }
        
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "KYC details submitted successfully"));
    }
}
