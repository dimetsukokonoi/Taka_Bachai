package com.takabachai.controller;

import com.takabachai.exception.BadRequestException;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
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
        return transactionService.createTransaction(transaction);
    }

    @PutMapping("/{id}")
    public Transaction updateTransaction(@PathVariable Long id,
                                         @Valid @RequestBody Transaction transaction) {
        return transactionService.updateTransaction(id, transaction);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}/search")
    public List<Transaction> searchTransactions(
            @PathVariable Long userId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        // Combinable filters: start with the broadest source, then narrow down.
        List<Transaction> result;
        if (startDate != null && endDate != null && !startDate.isBlank() && !endDate.isBlank()) {
            result = transactionService.getTransactionsByDateRange(userId,
                    parseDateTime(startDate, true),
                    parseDateTime(endDate, false));
        } else {
            result = transactionService.getTransactionsByUserId(userId);
        }

        if (type != null && !type.isBlank()) {
            String t = type.toUpperCase();
            result = result.stream().filter(tx -> t.equals(tx.getType())).collect(Collectors.toList());
        }
        if (categoryId != null) {
            result = result.stream()
                    .filter(tx -> categoryId.equals(tx.getCategoryId()))
                    .collect(Collectors.toList());
        }
        if (keyword != null && !keyword.isBlank()) {
            String k = keyword.toLowerCase();
            result = result.stream()
                    .filter(tx -> tx.getDescription() != null && tx.getDescription().toLowerCase().contains(k))
                    .collect(Collectors.toList());
        }
        return new ArrayList<>(result);
    }

    @PostMapping("/{id}/receipt")
    public ResponseEntity<Transaction> uploadReceipt(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Receipt file is empty");
        }

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String original = file.getOriginalFilename() == null ? "receipt" : file.getOriginalFilename();
        String filename = UUID.randomUUID() + "_" + original.replaceAll("[^a-zA-Z0-9._-]", "_");
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);

        Transaction updated = transactionService.updateReceiptPath(id, filePath.toString());
        return ResponseEntity.ok(updated);
    }

    /**
     * Robustly parse either a date (YYYY-MM-DD) or full ISO date-time.
     */
    private LocalDateTime parseDateTime(String raw, boolean startOfDay) {
        try {
            return LocalDateTime.parse(raw);
        } catch (DateTimeParseException ignore) {
            try {
                LocalDate date = LocalDate.parse(raw);
                return startOfDay ? date.atStartOfDay() : date.atTime(23, 59, 59);
            } catch (DateTimeParseException e) {
                throw new BadRequestException("Invalid date format: " + raw);
            }
        }
    }
}
