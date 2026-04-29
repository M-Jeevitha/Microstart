package com.project.microstart.controller;

import com.project.microstart.entity.Notification;
import com.project.microstart.entity.User;
import com.project.microstart.repository.NotificationRepository;
import com.project.microstart.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // Get all notifications for user
    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(notificationRepository.findByUserOrderByCreatedAtDesc(user));
    }

    // Get unread notifications count
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        long count = notificationRepository.countByUserAndReadFalse(user);
        return ResponseEntity.ok(Map.of("count", count));
    }

    // Mark notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }

    // Mark all notifications as read
    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        List<Notification> notifications = notificationRepository.findByUserAndReadFalseOrderByCreatedAtDesc(user);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    // Create notification (for internal use)
    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        return ResponseEntity.ok(notificationRepository.save(notification));
    }
}
