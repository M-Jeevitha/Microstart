package com.project.microstart.service;

import com.project.microstart.entity.*;

import java.util.List;

public interface FundingApplicationService {

    FundingApplication apply(Long fundingId, String email);

    List<FundingApplication> getUserApplications(String email);

    List<FundingApplication> getUserApplicationsByStatus(String email, ApplicationStatus status);

    List<FundingApplication> getAllApplications();

    List<FundingApplication> getApplicationsByStatus(ApplicationStatus status);

    FundingApplication approveApplication(Long id, String remarks);

    FundingApplication rejectApplication(Long id, String remarks);

    long getTotalApplications();

    long getApprovedApplications();

    long getRejectedApplications();

    long getUserApplicationCount(String email);
}