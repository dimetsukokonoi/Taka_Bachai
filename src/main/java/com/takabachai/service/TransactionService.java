package com.takabachai.service;

import com.takabachai.exception.BadRequestException;
import com.takabachai.exception.ResourceNotFoundException;
import com.takabachai.model.Transaction;
import com.takabachai.model.Wallet;
import com.takabachai.repository.CategoryRepository;
import com.takabachai.repository.TransactionRepository;
import com.takabachai.repository.UserRepository;
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
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public TransactionService(TransactionRepository transactionRepository,
                              WalletRepository walletRepository,
                              UserRepository userRepository,
                              CategoryRepository categoryRepository) {
        this.transactionRepository = transactionRepository;
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<Transaction> getTransactionsByUserId(Long userId) {
        return transactionRepository.findByUserIdOrderByTransactionDateDesc(userId);
    }

    public Optional<Transaction> getTransactionById(Long id) {
        return transactionRepository.findById(id);
    }

    @Transactional
    public Transaction createTransaction(Transaction transaction) {
        validateRefs(transaction);
        if (transaction.getTransactionDate() == null) {
            transaction.setTransactionDate(LocalDateTime.now());
        }
        Wallet wallet = walletRepository.findById(transaction.getWalletId())
                .orElseThrow(() -> ResourceNotFoundException.of("Wallet", transaction.getWalletId()));
        if (!wallet.getUserId().equals(transaction.getUserId())) {
            throw new BadRequestException("Wallet does not belong to the user");
        }

        Transaction saved = transactionRepository.save(transaction);
        applyToWallet(wallet, saved.getType(), saved.getAmount());
        walletRepository.save(wallet);
        return saved;
    }

    @Transactional
    public Transaction updateTransaction(Long id, Transaction data) {
        Transaction existing = transactionRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Transaction", id));

        // Reverse previous wallet effect.
        Wallet oldWallet = walletRepository.findById(existing.getWalletId())
                .orElseThrow(() -> ResourceNotFoundException.of("Wallet", existing.getWalletId()));
        reverseFromWallet(oldWallet, existing.getType(), existing.getAmount());
        walletRepository.save(oldWallet);

        // Validate new references.
        existing.setWalletId(data.getWalletId());
        existing.setCategoryId(data.getCategoryId());
        existing.setType(data.getType());
        existing.setAmount(data.getAmount());
        existing.setDescription(data.getDescription());
        existing.setTransactionDate(data.getTransactionDate() != null ? data.getTransactionDate() : existing.getTransactionDate());
        validateRefs(existing);

        Wallet newWallet = walletRepository.findById(existing.getWalletId())
                .orElseThrow(() -> ResourceNotFoundException.of("Wallet", existing.getWalletId()));
        if (!newWallet.getUserId().equals(existing.getUserId())) {
            throw new BadRequestException("Wallet does not belong to the user");
        }
        applyToWallet(newWallet, existing.getType(), existing.getAmount());
        walletRepository.save(newWallet);

        return transactionRepository.save(existing);
    }

    @Transactional
    public void deleteTransaction(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Transaction", id));

        Wallet wallet = walletRepository.findById(transaction.getWalletId())
                .orElseThrow(() -> ResourceNotFoundException.of("Wallet", transaction.getWalletId()));
        reverseFromWallet(wallet, transaction.getType(), transaction.getAmount());
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
                .orElseThrow(() -> ResourceNotFoundException.of("Transaction", id));
        transaction.setReceiptPath(receiptPath);
        return transactionRepository.save(transaction);
    }

    private void validateRefs(Transaction t) {
        if (t.getUserId() == null || !userRepository.existsById(t.getUserId())) {
            throw new BadRequestException("Invalid userId");
        }
        if (t.getAmount() == null || t.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Amount must be greater than 0");
        }
        if (t.getCategoryId() != null && !categoryRepository.existsById(t.getCategoryId())) {
            throw new BadRequestException("Invalid categoryId");
        }
    }

    private void applyToWallet(Wallet wallet, String type, BigDecimal amount) {
        if ("INCOME".equals(type)) {
            wallet.setBalance(wallet.getBalance().add(amount));
        } else {
            wallet.setBalance(wallet.getBalance().subtract(amount));
        }
    }

    private void reverseFromWallet(Wallet wallet, String type, BigDecimal amount) {
        if ("INCOME".equals(type)) {
            wallet.setBalance(wallet.getBalance().subtract(amount));
        } else {
            wallet.setBalance(wallet.getBalance().add(amount));
        }
    }
}
