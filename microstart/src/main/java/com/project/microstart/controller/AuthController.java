package com.project.microstart.controller;

import com.project.microstart.config.JwtService;
import com.project.microstart.dto.AuthResponse;
import com.project.microstart.dto.LoginRequest;
import com.project.microstart.dto.RegisterRequest;
import com.project.microstart.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    // 🔓 OPEN ENDPOINT
    @GetMapping("/open")
    public String open() {
        return "OPEN endpoint working";
    }

    // ✅ REGISTER API
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        userService.registerUser(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "message", "User registered successfully",
                        "fullName", request.getFullName(),
                        "email", request.getEmail()
                ));
    }

    // ✅ LOGIN API (EMAIL BASED — FINAL FIX)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),     // ✅ EMAIL
                            request.getPassword()
                    )
            );
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "error", "Invalid email or password"
                    ));
        }

        // ✅ JWT SUBJECT = EMAIL
        String token = jwtService.generateToken(request.getEmail());

        return ResponseEntity.ok(new AuthResponse(token));
    }


    // 🧪 TEST ENDPOINT
    @GetMapping("/test")
    public String test() {
        return "Auth API is working";
    }
}
