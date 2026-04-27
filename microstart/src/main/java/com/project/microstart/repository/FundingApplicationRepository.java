package com.project.microstart.repository;

import com.project.microstart.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FundingApplicationRepository extends JpaRepository<FundingApplication, Long> {

    List<FundingApplication> findByUser(User user);

    List<FundingApplication> findByUserAndStatus(User user, ApplicationStatus status);

    List<FundingApplication> findByStatus(ApplicationStatus status);

    long countByStatus(ApplicationStatus status);

    long countByUser(User user);
}