package com.project.microstart.controller;

import com.project.microstart.entity.Transaction;
import com.project.microstart.entity.User;
import com.project.microstart.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<Transaction> addTransaction(
            @RequestBody Transaction transaction,
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(
                transactionService.addTransaction(transaction, user)
        );
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> getTransactions(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(
                transactionService.getUserTransactions(user)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTransaction(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        transactionService.deleteTransaction(id, user);
        return ResponseEntity.ok("Transaction deleted successfully");
    }
}