package com.takabachai.service;

import com.takabachai.model.Transaction;
import com.takabachai.model.Wallet;
import com.takabachai.repository.TransactionRepository;
import com.takabachai.repository.WalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;

    public TransactionService(TransactionRepository transactionRepository,
            WalletRepository walletRepository) {
        this.transactionRepository = transactionRepository;
        this.walletRepository = walletRepository;
    }

    public List<Transaction> getTransactionsByUserId(Long userId) {
        return transactionRepository.findByUserIdOrderByTransactionDateDesc(userId);
    }

    public Optional<Transaction> getTransactionById(Long id) {
        return transactionRepository.findById(id);
    }

    @Transactional
    public Transaction createTransaction(Transaction transaction) {
        Transaction saved = transactionRepository.save(transaction);

        // Update wallet balance
        Wallet wallet = walletRepository.findById(transaction.getWalletId())
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        if ("INCOME".equals(transaction.getType())) {
            wallet.setBalance(wallet.getBalance().add(transaction.getAmount()));
        } else {
            wallet.setBalance(wallet.getBalance().subtract(transaction.getAmount()));
        }
        walletRepository.save(wallet);

        return saved;
    }

    @Transactional
    public void deleteTransaction(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        // Reverse the wallet balance change
        Wallet wallet = walletRepository.findById(transaction.getWalletId())
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        if ("INCOME".equals(transaction.getType())) {
            wallet.setBalance(wallet.getBalance().subtract(transaction.getAmount()));
        } else {
            wallet.setBalance(wallet.getBalance().add(transaction.getAmount()));
        }
        walletRepository.save(wallet);
        transactionRepository.deleteById(id);
    }

    public List<Transaction> searchTransactions(Long userId, String keyword) {
        return transactionRepository.searchByKeyword(userId, keyword);
    }

    public List<Transaction> getTransactionsByDateRange(Long userId,
            LocalDateTime startDate,
            LocalDateTime endDate) {
        return transactionRepository.findByUserIdAndDateRange(userId, startDate, endDate);
    }

    public List<Transaction> getTransactionsByType(Long userId, String type) {
        return transactionRepository.findByUserIdAndType(userId, type);
    }

    public List<Transaction> getTransactionsByCategory(Long userId, Long categoryId) {
        return transactionRepository.findByUserIdAndCategoryId(userId, categoryId);
    }

    public Transaction updateReceiptPath(Long id, String receiptPath) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found with id: " + id));
        transaction.setReceiptPath(receiptPath);
        return transactionRepository.save(transaction);
    }
}
