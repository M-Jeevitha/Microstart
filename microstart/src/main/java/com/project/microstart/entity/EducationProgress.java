package com.project.microstart.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "education_progress")
public class EducationProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private Integer score = 0;
    private Integer badges = 0;
    private Integer currentStreak = 0;
}
