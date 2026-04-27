package com.project.microstart.service;

import com.project.microstart.entity.Transaction;
import com.project.microstart.entity.User;

import java.util.List;

public interface TransactionService {

    Transaction addTransaction(Transaction transaction, User user);

    List<Transaction> getUserTransactions(User user);

    void deleteTransaction(Long id, User user);
}