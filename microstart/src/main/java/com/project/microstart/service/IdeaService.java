package com.project.microstart.service;

import com.project.microstart.entity.Idea;
import com.project.microstart.entity.IdeaStatus;

import java.util.List;

public interface IdeaService {

    Idea submitIdea(String email, String title, String description, String category, Double requestedAmount);

    List<Idea> getUserIdeas(String email);

    List<Idea> getOpenIdeas();

    List<Idea> getIdeasByStatus(IdeaStatus status);

    Idea getIdeaById(Long id);

    Idea updateIdeaStatus(Long id, IdeaStatus status);

    Idea acceptBid(Long ideaId, Long bidId, Double bidAmount);
}
