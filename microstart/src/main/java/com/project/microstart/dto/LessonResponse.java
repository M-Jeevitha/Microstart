package com.project.microstart.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LessonResponse {

    private Long id;
    private String title;
    private String content;
    private int lessonOrder;

}