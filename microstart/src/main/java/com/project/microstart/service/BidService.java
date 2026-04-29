package com.project.microstart.service;

import com.project.microstart.entity.Bid;

import java.util.List;

public interface BidService {

    Bid placeBid(String email, Long ideaId, Double bidAmount, String message);

    List<Bid> getBidsByIdea(Long ideaId);

    List<Bid> getBidsByUser(String email);

    Bid getHighestBid(Long ideaId);

    Bid acceptBid(Long bidId);

    Bid rejectBid(Long bidId);
}
