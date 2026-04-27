package com.project.microstart.repository;

import com.project.microstart.entity.Transaction;
import com.project.microstart.entity.User;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long> {

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = :type")
    Double sumByUserAndType(@Param("user") User user,
                            @Param("type") String type);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.type = :type")
    Double sumByType(@Param("type") String type);

    List<Transaction> findByUser(User user);
}