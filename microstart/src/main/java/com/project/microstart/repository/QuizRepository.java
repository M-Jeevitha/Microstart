package com.project.microstart.repository;

import com.project.microstart.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizRepository extends JpaRepository<QuizQuestion, Long> {

    List<QuizQuestion> findByLessonId(Long lessonId);

}