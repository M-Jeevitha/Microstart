package com.project.microstart.controller;

import com.project.microstart.dto.FundingRequest;
import com.project.microstart.entity.Funding;
import com.project.microstart.entity.FundingApplication;
import com.project.microstart.service.FundingApplicationService;
import com.project.microstart.service.FundingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/funding")
@RequiredArgsConstructor
public class AdminFundingController {

    private final FundingService fundingService;
    private final FundingApplicationService applicationService;

    // ➕ Create funding
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Funding createFunding(@RequestBody FundingRequest request) {
        return fundingService.createFunding(request);
    }

    // ✅ Approve application
    @PutMapping("/approve/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public FundingApplication approve(@PathVariable Long id,
                                      @RequestParam(defaultValue = "Approved") String remarks) {

        return applicationService.approveApplication(id, remarks);
    }

    // ❌ Reject application
    @PutMapping("/reject/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public FundingApplication reject(@PathVariable Long id,
                                     @RequestParam(defaultValue = "Rejected") String remarks) {

        return applicationService.rejectApplication(id, remarks);
    }
}