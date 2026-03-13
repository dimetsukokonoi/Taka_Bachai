package com.takabachai.controller;

import com.takabachai.model.Budget;
import com.takabachai.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "*")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping("/user/{userId}")
    public List<Budget> getBudgetsByUser(@PathVariable Long userId) {
        return budgetService.getBudgetsByUserId(userId);
    }

    @GetMapping("/user/{userId}/month/{month}")
    public List<Budget> getBudgetsByMonth(@PathVariable Long userId, @PathVariable String month) {
        return budgetService.getBudgetsByMonth(userId, month);
    }

    @GetMapping("/user/{userId}/status/{month}")
    public List<Map<String, Object>> getBudgetStatus(@PathVariable Long userId, @PathVariable String month) {
        return budgetService.getBudgetStatus(userId, month);
    }

    @PostMapping
    public Budget createBudget(@Valid @RequestBody Budget budget) {
        return budgetService.createBudget(budget);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Budget> updateBudget(@PathVariable Long id, @Valid @RequestBody Budget budget) {
        return ResponseEntity.ok(budgetService.updateBudget(id, budget));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }
}
