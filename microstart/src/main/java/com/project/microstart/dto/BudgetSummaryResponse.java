package com.project.microstart.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BudgetSummaryResponse {

    private Double totalIncome;
    private Double totalExpense;
    private Double balance;
}