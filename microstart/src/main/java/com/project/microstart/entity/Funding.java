package com.project.microstart.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fundings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Funding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String type; // LOAN / GRANT

    private Double amount;

    private String description;

    private boolean active;
}
