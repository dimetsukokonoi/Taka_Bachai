package com.takabachai.controller;

import com.takabachai.model.Transaction;
import com.takabachai.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    private final TransactionService transactionService;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/user/{userId}")
    public List<Transaction> getTransactionsByUser(@PathVariable Long userId) {
        return transactionService.getTransactionsByUserId(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable Long id) {
        return transactionService.getTransactionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Transaction createTransaction(@Valid @RequestBody Transaction transaction) {
        if (transaction.getTransactionDate() == null) {
            transaction.setTransactionDate(LocalDateTime.now());
        }
        return transactionService.createTransaction(transaction);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }

    // Search transactions
    @GetMapping("/user/{userId}/search")
    public List<Transaction> searchTransactions(
            @PathVariable Long userId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        if (keyword != null && !keyword.isEmpty()) {
            return transactionService.searchTransactions(userId, keyword);
        }
        if (type != null && !type.isEmpty()) {
            return transactionService.getTransactionsByType(userId, type);
        }
        if (categoryId != null) {
            return transactionService.getTransactionsByCategory(userId, categoryId);
        }
        if (startDate != null && endDate != null) {
            return transactionService.getTransactionsByDateRange(userId,
                    LocalDateTime.parse(startDate),
                    LocalDateTime.parse(endDate));
        }
        return transactionService.getTransactionsByUserId(userId);
    }

    // Upload receipt
    @PostMapping("/{id}/receipt")
    public ResponseEntity<Transaction> uploadReceipt(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);

        Transaction updated = transactionService.updateReceiptPath(id, filePath.toString());
        return ResponseEntity.ok(updated);
    }
}
