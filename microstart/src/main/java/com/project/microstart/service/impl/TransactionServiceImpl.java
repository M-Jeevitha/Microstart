package com.project.microstart.service.impl;

import com.project.microstart.entity.Transaction;
import com.project.microstart.entity.User;
import com.project.microstart.exception.ResourceNotFoundException;
import com.project.microstart.exception.UnauthorizedException;
import com.project.microstart.repository.TransactionRepository;
import com.project.microstart.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;

    @Override
    public Transaction addTransaction(Transaction transaction, User user) {
        transaction.setUser(user);
        return transactionRepository.save(transaction);
    }

    @Override
    public List<Transaction> getUserTransactions(User user) {
        return transactionRepository.findByUser(user);
    }

    @Override
    public void deleteTransaction(Long id, User user) {

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You cannot delete this transaction");
        }

        transactionRepository.delete(transaction);
    }
}