package com.project.microstart.service.impl;

import com.project.microstart.entity.*;
import com.project.microstart.repository.*;
import com.project.microstart.service.FundingApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FundingApplicationServiceImpl implements FundingApplicationService {

    private final FundingApplicationRepository applicationRepository;
    private final FundingRepository fundingRepository;
    private final UserRepository userRepository;

    @Override
    public FundingApplication apply(Long fundingId, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Funding funding = fundingRepository.findById(fundingId)
                .orElseThrow(() -> new RuntimeException("Funding not found"));

        FundingApplication application = FundingApplication.builder()
                .user(user)
                .funding(funding)
                .status(ApplicationStatus.PENDING)
                .build();

        return applicationRepository.save(application);
    }

    @Override
    public List<FundingApplication> getUserApplications(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return applicationRepository.findByUser(user);
    }

    @Override
    public List<FundingApplication> getUserApplicationsByStatus(String email, ApplicationStatus status) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return applicationRepository.findByUserAndStatus(user, status);
    }

    @Override
    public List<FundingApplication> getAllApplications() {
        return applicationRepository.findAll();
    }

    @Override
    public List<FundingApplication> getApplicationsByStatus(ApplicationStatus status) {
        return applicationRepository.findByStatus(status);
    }

    @Override
    public FundingApplication approveApplication(Long id, String remarks) {

        FundingApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(ApplicationStatus.APPROVED);
        application.setRemarks(remarks);

        return applicationRepository.save(application);
    }

    @Override
    public FundingApplication rejectApplication(Long id, String remarks) {

        FundingApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(ApplicationStatus.REJECTED);
        application.setRemarks(remarks);

        return applicationRepository.save(application);
    }

    @Override
    public long getTotalApplications() {
        return applicationRepository.count();
    }

    @Override
    public long getApprovedApplications() {
        return applicationRepository.countByStatus(ApplicationStatus.APPROVED);
    }

    @Override
    public long getRejectedApplications() {
        return applicationRepository.countByStatus(ApplicationStatus.REJECTED);
    }

    @Override
    public long getUserApplicationCount(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return applicationRepository.countByUser(user);
    }
}