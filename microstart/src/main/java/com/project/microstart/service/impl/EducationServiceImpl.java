package com.project.microstart.service.impl;

import com.project.microstart.dto.*;
import com.project.microstart.entity.*;
import com.project.microstart.repository.*;
import com.project.microstart.service.EducationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EducationServiceImpl implements EducationService {


    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final QuizRepository quizRepository;

    // ✅ GET COURSES
    @Override
    public List<CourseResponse> getAllCourses() {

        return courseRepository.findAll()
                .stream()
                .map(course -> new CourseResponse(
                        course.getId(),
                        course.getTitle(),
                        course.getDescription(),
                        course.getLevel()
                ))
                .toList();
    }

    // ✅ GET LESSONS
    @Override
    public List<LessonResponse> getLessonsByCourse(Long courseId) {

        return lessonRepository.findByCourseId(courseId)
                .stream()
                .map(lesson -> new LessonResponse(
                        lesson.getId(),
                        lesson.getTitle(),
                        lesson.getContent(),
                        lesson.getLessonOrder()
                ))
                .toList();
    }

    // ✅ GET QUIZ
    @Override
    public List<QuizResponse> getQuizByLesson(Long lessonId) {

        return quizRepository.findByLessonId(lessonId)
                .stream()
                .map(q -> new QuizResponse(
                        q.getId(),
                        q.getQuestion(),
                        q.getOptionA(),
                        q.getOptionB(),
                        q.getOptionC(),
                        q.getOptionD()
                ))
                .toList();
    }

    // ✅ SUBMIT QUIZ (FULL LOGIC)
    @Override
    public void submitQuiz(Long userId, QuizSubmitRequest request) {

        // 🔹 Get all quiz questions for the lesson
        List<QuizQuestion> questions = quizRepository.findByLessonId(request.getLessonId());

        int score = 0;

        // 🔹 Loop through questions and check answers
        for (QuizQuestion q : questions) {

            String correctAnswer = q.getCorrectAnswer();

            // Get user's answer using question ID
            String userAnswer = request.getAnswers().get(q.getId());

            if (userAnswer != null && userAnswer.equalsIgnoreCase(correctAnswer)) {
                score++;
            }
        }

        // 🔹 Print result (for now)
        System.out.println("User ID: " + userId);
        System.out.println("Score: " + score + "/" + questions.size());

        // 🔥 (OPTIONAL FUTURE)
        // Save progress
        // Award badge
        // Update dashboard
    }


}
