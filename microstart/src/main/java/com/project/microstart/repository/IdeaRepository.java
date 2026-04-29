package com.project.microstart.repository;

import com.project.microstart.entity.Idea;
import com.project.microstart.entity.IdeaStatus;
import com.project.microstart.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IdeaRepository extends JpaRepository<Idea, Long> {

    List<Idea> findByUser(User user);
    List<Idea> findByStatus(IdeaStatus status);
    List<Idea> findByStatusOrderByCreatedAtDesc(IdeaStatus status);
}
