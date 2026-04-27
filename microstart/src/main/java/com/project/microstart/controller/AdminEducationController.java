package com.project.microstart.controller;

import com.project.microstart.dto.CourseResponse;
import com.project.microstart.entity.*;
import com.project.microstart.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/education")
@RequiredArgsConstructor
public class AdminEducationController {


    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final QuizRepository quizRepository;
    private final BadgeRepository badgeRepository;

    // ✅ Add Course (RETURN DTO)
    @PostMapping("/course")
    public CourseResponse addCourse(@RequestBody Course course){

        Course saved = courseRepository.save(course);

        return new CourseResponse(
                saved.getId(),
                saved.getTitle(),
                saved.getDescription(),
                saved.getLevel()
        );
    }

    // ✅ Add Lesson (RETURN STRING)
    @PostMapping("/course/{courseId}/lesson")
    public String addLesson(@PathVariable Long courseId,
                            @RequestBody Lesson lesson){

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        lesson.setCourse(course);

        lessonRepository.save(lesson);

        return "Lesson added successfully";
    }

    // ✅ Add Quiz (RETURN STRING)
    @PostMapping("/lesson/{lessonId}/quiz")
    public String addQuiz(@PathVariable Long lessonId,
                          @RequestBody QuizQuestion quiz){

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        quiz.setLesson(lesson);

        quizRepository.save(quiz);

        return "Quiz added successfully";
    }

    // ✅ Add Badge (RETURN STRING)
    @PostMapping("/badge")
    public String addBadge(@RequestBody Badge badge){

        badgeRepository.save(badge);

        return "Badge added successfully";
    }


}
