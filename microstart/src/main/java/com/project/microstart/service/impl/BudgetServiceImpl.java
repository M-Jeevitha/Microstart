package com.project.microstart.service.impl;

import com.project.microstart.dto.BudgetSummaryResponse;
import com.project.microstart.entity.Transaction;
import com.project.microstart.entity.User;
import com.project.microstart.repository.TransactionRepository;
import com.project.microstart.repository.UserRepository;
import com.project.microstart.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    @Override
    public Transaction addTransaction(Transaction transaction, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        transaction.setUser(user);

        // Set default date if not provided
        if (transaction.getDate() == null) {
            transaction.setDate(LocalDate.now());
        }

        // Safety check for type
        if (transaction.getType() == null) {
            throw new RuntimeException("Transaction type must be INCOME or EXPENSE");
        }

        return transactionRepository.save(transaction);
    }

    @Override
    public List<Transaction> getUserTransactions(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return transactionRepository.findByUser(user);
    }

    @Override
    public BudgetSummaryResponse getSummary(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Transaction> transactions =
                transactionRepository.findByUser(user);

        double totalIncome = transactions.stream()
                .filter(t -> t.getType() != null &&
                        t.getType().equalsIgnoreCase("INCOME"))
                .mapToDouble(Transaction::getAmount)
                .sum();

        double totalExpense = transactions.stream()
                .filter(t -> t.getType() != null &&
                        t.getType().equalsIgnoreCase("EXPENSE"))
                .mapToDouble(Transaction::getAmount)
                .sum();

        return BudgetSummaryResponse.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .balance(totalIncome - totalExpense)
                .build();
    }
}