package com.project.microstart.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FundingRequest {

    private String title;
    private String type;
    private Double amount;
    private String description;
}
