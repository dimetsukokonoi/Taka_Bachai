package com.takabachai.controller;

import com.takabachai.model.FinancialGoal;
import com.takabachai.service.FinancialGoalService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "*")
public class FinancialGoalController {

    private final FinancialGoalService goalService;

    public FinancialGoalController(FinancialGoalService goalService) {
        this.goalService = goalService;
    }

    @GetMapping("/user/{userId}")
    public List<FinancialGoal> getGoalsByUser(@PathVariable Long userId) {
        return goalService.getGoalsByUserId(userId);
    }

    @GetMapping("/user/{userId}/active")
    public List<FinancialGoal> getActiveGoals(@PathVariable Long userId) {
        return goalService.getActiveGoals(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FinancialGoal> getGoalById(@PathVariable Long id) {
        return goalService.getGoalById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public FinancialGoal createGoal(@Valid @RequestBody FinancialGoal goal) {
        return goalService.createGoal(goal);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FinancialGoal> updateGoal(@PathVariable Long id, @Valid @RequestBody FinancialGoal goal) {
        return ResponseEntity.ok(goalService.updateGoal(id, goal));
    }

    @PostMapping("/{id}/add")
    public ResponseEntity<FinancialGoal> addToGoal(@PathVariable Long id, @RequestBody Map<String, BigDecimal> body) {
        BigDecimal amount = body.get("amount");
        return ResponseEntity.ok(goalService.addToGoal(id, amount));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return ResponseEntity.noContent().build();
    }
}
