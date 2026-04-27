package com.project.microstart.dto;

import lombok.Data;
import java.util.Map;

@Data
public class QuizSubmitRequest {

    private Long lessonId;

    // questionId -> selectedAnswer (A/B/C/D)
    private Map<Long, String> answers;
}