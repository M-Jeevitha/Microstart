package com.project.microstart.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuizSubmissionRequest {

    private Long questionId;
    private String selectedAnswer;

}