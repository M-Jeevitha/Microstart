package com.project.microstart.service;

import com.project.microstart.dto.BudgetSummaryResponse;
import com.project.microstart.entity.Transaction;

import java.util.List;

public interface BudgetService {

    Transaction addTransaction(Transaction transaction, String email);

    List<Transaction> getUserTransactions(String email);

    BudgetSummaryResponse getSummary(String email);
}