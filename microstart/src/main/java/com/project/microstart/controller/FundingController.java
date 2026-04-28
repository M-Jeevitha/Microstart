package com.project.microstart.controller;

import com.project.microstart.entity.ApplicationStatus;
import com.project.microstart.entity.Funding;
import com.project.microstart.entity.FundingApplication;
import com.project.microstart.service.FundingApplicationService;
import com.project.microstart.service.FundingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/funding")
@RequiredArgsConstructor
public class FundingController {

    private final FundingService fundingService;
    private final FundingApplicationService applicationService;

    // 🔓 View available funding
    @GetMapping
    public List<Funding> viewFunding() {
        return fundingService.getAllActiveFundings();
    }

    // ✍ Apply for funding
    @PostMapping("/apply/{fundingId}")
    public FundingApplication apply(
            @PathVariable Long fundingId,
            Authentication authentication) {

        return applicationService.apply(
                fundingId,
                authentication.getName()
        );
    }

    // 📄 Track all applications of logged-in user
    @GetMapping("/applications")
    public List<FundingApplication> myApplications(
            Authentication authentication) {

        return applicationService.getUserApplications(
                authentication.getName()
        );
    }

    // 📄 Track applications by status
    @GetMapping("/applications/status/{status}")
    public List<FundingApplication> myApplicationsByStatus(
            @PathVariable ApplicationStatus status,
            Authentication authentication) {

        return applicationService.getUserApplicationsByStatus(
                authentication.getName(),
                status
        );
    }

    // 👨‍💼 Admin - view all applications
    @GetMapping("/admin/applications")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public List<FundingApplication> allApplications() {
        return applicationService.getAllApplications();
    }

    // 👨‍💼 Admin - filter applications by status
    @GetMapping("/admin/applications/{status}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public List<FundingApplication> applicationsByStatus(
            @PathVariable ApplicationStatus status) {

        return applicationService.getApplicationsByStatus(status);
    }

    // 🔥 NEW: Admin approve application
    @PutMapping("/admin/approve/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public FundingApplication approve(
            @PathVariable Long id,
            @RequestParam String remarks) {

        return applicationService.approveApplication(id, remarks);
    }

    // 🔥 NEW: Admin reject application
    @PutMapping("/admin/reject/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public FundingApplication reject(
            @PathVariable Long id,
            @RequestParam String remarks) {

        return applicationService.rejectApplication(id, remarks);
    }
}