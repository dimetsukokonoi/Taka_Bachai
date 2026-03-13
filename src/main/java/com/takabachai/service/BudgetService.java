package com.takabachai.service;

import com.takabachai.model.Budget;
import com.takabachai.model.Transaction;
import com.takabachai.repository.BudgetRepository;
import com.takabachai.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;

    public BudgetService(BudgetRepository budgetRepository,
            TransactionRepository transactionRepository) {
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<Budget> getBudgetsByUserId(Long userId) {
        return budgetRepository.findByUserId(userId);
    }

    public List<Budget> getBudgetsByMonth(Long userId, String month) {
        return budgetRepository.findByUserIdAndBudgetMonth(userId, month);
    }

    public Budget createBudget(Budget budget) {
        return budgetRepository.save(budget);
    }

    public Budget updateBudget(Long id, Budget budgetData) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found with id: " + id));
        budget.setLimitAmount(budgetData.getLimitAmount());
        budget.setCategoryId(budgetData.getCategoryId());
        budget.setBudgetMonth(budgetData.getBudgetMonth());
        return budgetRepository.save(budget);
    }

    public void deleteBudget(Long id) {
        budgetRepository.deleteById(id);
    }

    /**
     * Get budget status: limit vs actual spending for a given month
     */
    public List<Map<String, Object>> getBudgetStatus(Long userId, String month) {
        List<Budget> budgets = budgetRepository.findByUserIdAndBudgetMonth(userId, month);
        List<Map<String, Object>> result = new ArrayList<>();

        YearMonth ym = YearMonth.parse(month, DateTimeFormatter.ofPattern("yyyy-MM"));
        LocalDateTime startDate = ym.atDay(1).atStartOfDay();
        LocalDateTime endDate = ym.atEndOfMonth().atTime(23, 59, 59);

        for (Budget budget : budgets) {
            List<Transaction> transactions = transactionRepository
                    .findByUserIdAndTypeAndDateRange(userId, "EXPENSE", startDate, endDate);

            BigDecimal spent = transactions.stream()
                    .filter(t -> budget.getCategoryId() != null &&
                            budget.getCategoryId().equals(t.getCategoryId()))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> status = new HashMap<>();
            status.put("budgetId", budget.getId());
            status.put("categoryId", budget.getCategoryId());
            status.put("budgetMonth", budget.getBudgetMonth());
            status.put("limitAmount", budget.getLimitAmount());
            status.put("spentAmount", spent);
            status.put("remainingAmount", budget.getLimitAmount().subtract(spent));
            status.put("isOverBudget", spent.compareTo(budget.getLimitAmount()) > 0);
            result.add(status);
        }

        return result;
    }
}
