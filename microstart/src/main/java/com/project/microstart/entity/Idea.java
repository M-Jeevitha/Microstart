package com.project.microstart.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ideas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Idea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String title;
    private String description;
    private String category;
    private Double requestedAmount;

    @Enumerated(EnumType.STRING)
    private IdeaStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Double highestBid;
    private Long winningBidId;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.status = IdeaStatus.OPEN;
        this.highestBid = 0.0;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
