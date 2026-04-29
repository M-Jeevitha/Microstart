package com.project.microstart.service.impl;

import com.project.microstart.entity.Idea;
import com.project.microstart.entity.IdeaStatus;
import com.project.microstart.entity.User;
import com.project.microstart.repository.IdeaRepository;
import com.project.microstart.repository.UserRepository;
import com.project.microstart.service.IdeaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IdeaServiceImpl implements IdeaService {

    private final IdeaRepository ideaRepository;
    private final UserRepository userRepository;

    @Override
    public Idea submitIdea(String email, String title, String description, String category, Double requestedAmount) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Idea idea = Idea.builder()
                .user(user)
                .title(title)
                .description(description)
                .category(category)
                .requestedAmount(requestedAmount)
                .status(IdeaStatus.OPEN)
                .highestBid(0.0)
                .build();

        return ideaRepository.save(idea);
    }

    @Override
    public List<Idea> getUserIdeas(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ideaRepository.findByUser(user);
    }

    @Override
    public List<Idea> getOpenIdeas() {
        return ideaRepository.findByStatusOrderByCreatedAtDesc(IdeaStatus.OPEN);
    }

    @Override
    public List<Idea> getIdeasByStatus(IdeaStatus status) {
        return ideaRepository.findByStatus(status);
    }

    @Override
    public Idea getIdeaById(Long id) {
        return ideaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Idea not found"));
    }

    @Override
    public Idea updateIdeaStatus(Long id, IdeaStatus status) {
        Idea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Idea not found"));
        idea.setStatus(status);
        return ideaRepository.save(idea);
    }

    @Override
    @Transactional
    public Idea acceptBid(Long ideaId, Long bidId, Double bidAmount) {
        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found"));
        
        idea.setStatus(IdeaStatus.AWARDED);
        idea.setHighestBid(bidAmount);
        idea.setWinningBidId(bidId);
        
        return ideaRepository.save(idea);
    }
}
