package com.project.microstart.service.impl;

import com.project.microstart.entity.Bid;
import com.project.microstart.entity.BidStatus;
import com.project.microstart.entity.Idea;
import com.project.microstart.entity.IdeaStatus;
import com.project.microstart.entity.User;
import com.project.microstart.repository.BidRepository;
import com.project.microstart.repository.IdeaRepository;
import com.project.microstart.repository.UserRepository;
import com.project.microstart.service.BidService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BidServiceImpl implements BidService {

    private final BidRepository bidRepository;
    private final IdeaRepository ideaRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public Bid placeBid(String email, Long ideaId, Double bidAmount, String message) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found"));

        if (idea.getStatus() != IdeaStatus.OPEN && idea.getStatus() != IdeaStatus.BIDDING) {
            throw new RuntimeException("Idea is not open for bidding");
        }

        if (bidAmount <= idea.getHighestBid()) {
            throw new RuntimeException("Bid amount must be higher than current highest bid");
        }

        Bid bid = Bid.builder()
                .idea(idea)
                .user(user)
                .bidAmount(bidAmount)
                .message(message)
                .status(BidStatus.ACTIVE)
                .build();

        Bid savedBid = bidRepository.save(bid);

        // Update idea's highest bid and status
        idea.setHighestBid(bidAmount);
        idea.setStatus(IdeaStatus.BIDDING);
        ideaRepository.save(idea);

        return savedBid;
    }

    @Override
    public List<Bid> getBidsByIdea(Long ideaId) {
        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found"));
        return bidRepository.findByIdeaOrderByBidAmountDesc(idea);
    }

    @Override
    public List<Bid> getBidsByUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bidRepository.findByUser(user);
    }

    @Override
    public Bid getHighestBid(Long ideaId) {
        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found"));
        List<Bid> bids = bidRepository.findByIdeaOrderByBidAmountDesc(idea);
        return bids.isEmpty() ? null : bids.get(0);
    }

    @Override
    @Transactional
    public Bid acceptBid(Long bidId) {
        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));

        bid.setStatus(BidStatus.ACCEPTED);
        
        // Reject all other bids for this idea
        List<Bid> otherBids = bidRepository.findByIdea(bid.getIdea());
        otherBids.forEach(b -> {
            if (!b.getId().equals(bidId)) {
                b.setStatus(BidStatus.REJECTED);
                bidRepository.save(b);
            }
        });

        return bidRepository.save(bid);
    }

    @Override
    public Bid rejectBid(Long bidId) {
        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));

        bid.setStatus(BidStatus.REJECTED);
        return bidRepository.save(bid);
    }
}
