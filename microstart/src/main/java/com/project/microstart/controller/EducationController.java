package com.project.microstart.controller;

import com.project.microstart.dto.*;
import com.project.microstart.service.EducationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/education")
@RequiredArgsConstructor
public class EducationController {


    private final EducationService educationService;

    // ✅ GET ALL COURSES
    @GetMapping("/courses")
    public List<CourseResponse> getCourses() {
        return educationService.getAllCourses();
    }

    // ✅ GET LESSONS BY COURSE
    @GetMapping("/courses/{courseId}/lessons")
    public List<LessonResponse> getLessons(@PathVariable Long courseId) {
        return educationService.getLessonsByCourse(courseId);
    }

    // ✅ GET QUIZ BY LESSON
    @GetMapping("/lessons/{lessonId}/quiz")
    public List<QuizResponse> getQuiz(@PathVariable Long lessonId) {
        return educationService.getQuizByLesson(lessonId);
    }

    // ✅ SUBMIT QUIZ (IMPORTANT)
    @PostMapping("/quiz/submit")
    public String submitQuiz(@RequestBody QuizSubmitRequest request,
                             @RequestParam(required = false) Long userId) {

        // For now, we'll use a default user ID or get it from authentication
        // In a real implementation, you'd get the user ID from the authentication context
        Long currentUserId = userId != null ? userId : 1L; // Default fallback
        
        educationService.submitQuiz(currentUserId, request);

        return "Quiz submitted successfully!";
    }

    // ✅ TEST API (for debugging)
    @GetMapping("/quiz/test")
    public String testQuizApi() {
        return "Quiz API Working";
    }


}
