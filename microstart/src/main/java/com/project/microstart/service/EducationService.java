package com.project.microstart.service;

import com.project.microstart.dto.*;
import java.util.List;

public interface EducationService {

    List<CourseResponse> getAllCourses();

    List<LessonResponse> getLessonsByCourse(Long courseId);

    List<QuizResponse> getQuizByLesson(Long lessonId);

    void submitQuiz(Long userId, QuizSubmitRequest request);
}