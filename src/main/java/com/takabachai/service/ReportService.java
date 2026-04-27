package com.takabachai.service;

import com.takabachai.model.Transaction;
import com.takabachai.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ReportService {

    private final TransactionRepository transactionRepository;

    public ReportService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    /**
     * Income vs Expense report for a given month
     */
    public Map<String, Object> getMonthlyReport(Long userId, String month) {
        YearMonth ym = YearMonth.parse(month, DateTimeFormatter.ofPattern("yyyy-MM"));
        LocalDateTime startDate = ym.atDay(1).atStartOfDay();
        LocalDateTime endDate = ym.atEndOfMonth().atTime(23, 59, 59);

        List<Transaction> transactions = transactionRepository
                .findByUserIdAndDateRange(userId, startDate, endDate);

        BigDecimal totalIncome = transactions.stream()
                .filter(t -> "INCOME".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = transactions.stream()
                .filter(t -> "EXPENSE".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Group expenses by category
        Map<Long, BigDecimal> expenseByCategory = new HashMap<>();
        for (Transaction t : transactions) {
            if ("EXPENSE".equals(t.getType()) && t.getCategoryId() != null) {
                expenseByCategory.merge(t.getCategoryId(), t.getAmount(), BigDecimal::add);
            }
        }

        // Group income by category
        Map<Long, BigDecimal> incomeByCategory = new HashMap<>();
        for (Transaction t : transactions) {
            if ("INCOME".equals(t.getType()) && t.getCategoryId() != null) {
                incomeByCategory.merge(t.getCategoryId(), t.getAmount(), BigDecimal::add);
            }
        }

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("month", month);
        report.put("totalIncome", totalIncome);
        report.put("totalExpense", totalExpense);
        report.put("netSavings", totalIncome.subtract(totalExpense));
        report.put("transactionCount", transactions.size());
        report.put("expenseByCategory", expenseByCategory);
        report.put("incomeByCategory", incomeByCategory);

        return report;
    }

    public List<com.takabachai.dto.CategoryInsightDTO> getSpendingInsights(Long userId) {
        return transactionRepository.getSpendingInsights(userId);
    }
}
