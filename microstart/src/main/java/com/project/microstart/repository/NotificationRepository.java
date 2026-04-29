package com.project.microstart.repository;

import com.project.microstart.entity.Notification;
import com.project.microstart.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    
    List<Notification> findByUserAndReadFalseOrderByCreatedAtDesc(User user);
    
    long countByUserAndReadFalse(User user);
}
