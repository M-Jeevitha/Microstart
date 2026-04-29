package com.project.microstart.controller;

import com.project.microstart.entity.User;
import com.project.microstart.repository.UserRepository;
import com.project.microstart.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<String> adminProfile(Authentication authentication) {
        return ResponseEntity.ok("ADMIN profile accessed");
    }

    // Dashboard Analytics
    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getDashboardStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByRole("ROLE_USER");
        
        return ResponseEntity.ok(Map.of(
            "totalUsers", totalUsers,
            "activeUsers", activeUsers,
            "pendingApplications", 0, // Will be connected to funding applications
            "fundsDisbursed", 0
        ));
    }

    // User Management
    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/users/{id}/suspend")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> suspendUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole("ROLE_SUSPENDED");
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User suspended successfully"));
    }

    @PutMapping("/users/{id}/activate")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> activateUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole("ROLE_USER");
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User activated successfully"));
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
}