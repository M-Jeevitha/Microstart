package com.project.microstart.controller;

import com.project.microstart.entity.*;
import com.project.microstart.service.BidService;
import com.project.microstart.service.FundingApplicationService;
import com.project.microstart.service.FundingService;
import com.project.microstart.service.IdeaService;
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
    private final IdeaService ideaService;
    private final BidService bidService;

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

    // ==================== IDEA SUBMISSION ====================

    // 💡 Submit new idea for funding
    @PostMapping("/ideas")
    public Idea submitIdea(
            @RequestBody IdeaRequest request,
            Authentication authentication) {

        return ideaService.submitIdea(
                authentication.getName(),
                request.getTitle(),
                request.getDescription(),
                request.getCategory(),
                request.getRequestedAmount()
        );
    }

    // 📄 Get user's ideas
    @GetMapping("/ideas/my")
    public List<Idea> myIdeas(Authentication authentication) {
        return ideaService.getUserIdeas(authentication.getName());
    }

    // 📄 Get all open ideas for bidding
    @GetMapping("/ideas/open")
    public List<Idea> getOpenIdeas() {
        return ideaService.getOpenIdeas();
    }

    // 📄 Get idea by ID
    @GetMapping("/ideas/{id}")
    public Idea getIdea(@PathVariable Long id) {
        return ideaService.getIdeaById(id);
    }

    // ==================== BIDDING SYSTEM ====================

    // 💰 Place a bid on an idea (Admin/Investor only)
    @PostMapping("/ideas/{ideaId}/bid")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public Bid placeBid(
            @PathVariable Long ideaId,
            @RequestBody BidRequest request,
            Authentication authentication) {

        return bidService.placeBid(
                authentication.getName(),
                ideaId,
                request.getBidAmount(),
                request.getMessage()
        );
    }

    // 📄 Get all bids for an idea
    @GetMapping("/ideas/{ideaId}/bids")
    public List<Bid> getBidsForIdea(@PathVariable Long ideaId) {
        return bidService.getBidsByIdea(ideaId);
    }

    // 📄 Get user's bids
    @GetMapping("/bids/my")
    public List<Bid> myBids(Authentication authentication) {
        return bidService.getBidsByUser(authentication.getName());
    }

    // ✅ Accept a bid (Entrepreneur only)
    @PutMapping("/ideas/{ideaId}/accept-bid/{bidId}")
    public Idea acceptBid(
            @PathVariable Long ideaId,
            @PathVariable Long bidId,
            Authentication authentication) {

        Idea idea = ideaService.getIdeaById(ideaId);
        if (!idea.getUser().getEmail().equals(authentication.getName())) {
            throw new RuntimeException("You can only accept bids for your own ideas");
        }

        Bid bid = bidService.getHighestBid(ideaId);
        if (bid == null || !bid.getId().equals(bidId)) {
            throw new RuntimeException("Invalid bid");
        }

        bidService.acceptBid(bidId);
        return ideaService.acceptBid(ideaId, bidId, bid.getBidAmount());
    }

    // ==================== DTOs ====================

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class IdeaRequest {
        private String title;
        private String description;
        private String category;
        private Double requestedAmount;
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class BidRequest {
        private Double bidAmount;
        private String message;
    }
}