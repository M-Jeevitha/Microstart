package com.project.microstart.repository;

import com.project.microstart.entity.Bid;
import com.project.microstart.entity.BidStatus;
import com.project.microstart.entity.Idea;
import com.project.microstart.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BidRepository extends JpaRepository<Bid, Long> {

    List<Bid> findByIdea(Idea idea);
    List<Bid> findByIdeaOrderByBidAmountDesc(Idea idea);
    List<Bid> findByIdeaAndStatus(Idea idea, BidStatus status);
    List<Bid> findByUser(User user);
}
