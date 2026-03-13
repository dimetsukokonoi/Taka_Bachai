package com.takabachai.repository;

import com.takabachai.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserIdOrderByTransactionDateDesc(Long userId);

    List<Transaction> findByUserIdAndType(Long userId, String type);

    List<Transaction> findByUserIdAndCategoryId(Long userId, Long categoryId);

    List<Transaction> findByUserIdAndWalletId(Long userId, Long walletId);

    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId " +
            "AND t.transactionDate BETWEEN :startDate AND :endDate " +
            "ORDER BY t.transactionDate DESC")
    List<Transaction> findByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId " +
            "AND LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "ORDER BY t.transactionDate DESC")
    List<Transaction> searchByKeyword(
            @Param("userId") Long userId,
            @Param("keyword") String keyword);

    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId AND t.type = :type " +
            "AND t.transactionDate BETWEEN :startDate AND :endDate")
    List<Transaction> findByUserIdAndTypeAndDateRange(
            @Param("userId") Long userId,
            @Param("type") String type,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
