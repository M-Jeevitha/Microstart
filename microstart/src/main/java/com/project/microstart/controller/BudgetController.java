package com.project.microstart.controller;

import com.project.microstart.dto.BudgetSummaryResponse;
import com.project.microstart.entity.Transaction;
import com.project.microstart.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    public ResponseEntity<Transaction> addTransaction(
            @RequestBody Transaction transaction,
            Authentication authentication) {

        String email = authentication.getName();

        Transaction saved =
                budgetService.addTransaction(transaction, email);

        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> getTransactions(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                budgetService.getUserTransactions(email)
        );
    }

    @GetMapping("/summary")
    public ResponseEntity<BudgetSummaryResponse> getSummary(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                budgetService.getSummary(email)
        );
    }
}