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

import com.project.microstart.entity.RefreshToken;
import com.project.microstart.entity.PasswordResetToken;
import com.project.microstart.entity.User;
import com.project.microstart.repository.PasswordResetTokenRepository;
import com.project.microstart.repository.UserRepository;
import com.project.microstart.service.RefreshTokenService;
import com.project.microstart.service.EmailService;
import com.project.microstart.dto.TokenRefreshRequest;
import com.project.microstart.dto.TokenRefreshResponse;
import com.project.microstart.dto.ForgotPasswordRequest;
import com.project.microstart.dto.ResetPasswordRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.time.Instant;
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final UserDetailsService userDetailsService;

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

        org.springframework.security.core.userdetails.UserDetails userDetails = 
            (org.springframework.security.core.userdetails.UserDetails) authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),     // ✅ EMAIL
                        request.getPassword()
                )
        ).getPrincipal();

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new RuntimeException("User not found"));
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
        String token = jwtService.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponse(token, refreshToken.getToken()));
    }


    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshtoken(@RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    org.springframework.security.core.userdetails.UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
                    String token = jwtService.generateToken(userDetails);
                    return ResponseEntity.ok(new TokenRefreshResponse(token, requestRefreshToken));
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (!userOptional.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No user found with this email"));
        }

        User user = userOptional.get();
        String token = UUID.randomUUID().toString();
        
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(Instant.now().plusMillis(3600000)); // 1 hour
        passwordResetTokenRepository.save(resetToken);

        String resetUrl = "http://localhost:8080/reset-password.html?token=" + token;
        emailService.sendSimpleMessage(user.getEmail(), "Password Reset Request", 
            "To reset your password, click the link below:\n" + resetUrl);

        return ResponseEntity.ok(Map.of("message", "Password reset link sent to your email"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        Optional<PasswordResetToken> tokenOptional = passwordResetTokenRepository.findByToken(request.getToken());
        
        if (!tokenOptional.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid token"));
        }

        PasswordResetToken resetToken = tokenOptional.get();
        if (resetToken.getExpiryDate().isBefore(Instant.now())) {
            passwordResetTokenRepository.delete(resetToken);
            return ResponseEntity.badRequest().body(Map.of("error", "Token has expired"));
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        passwordResetTokenRepository.delete(resetToken);

        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }
}
