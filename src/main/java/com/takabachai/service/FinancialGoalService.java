package com.takabachai.service;

import com.takabachai.model.FinancialGoal;
import com.takabachai.repository.FinancialGoalRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class FinancialGoalService {

    private final FinancialGoalRepository goalRepository;

    public FinancialGoalService(FinancialGoalRepository goalRepository) {
        this.goalRepository = goalRepository;
    }

    public List<FinancialGoal> getGoalsByUserId(Long userId) {
        return goalRepository.findByUserId(userId);
    }

    public List<FinancialGoal> getActiveGoals(Long userId) {
        return goalRepository.findByUserIdAndStatus(userId, "IN_PROGRESS");
    }

    public Optional<FinancialGoal> getGoalById(Long id) {
        return goalRepository.findById(id);
    }

    public FinancialGoal createGoal(FinancialGoal goal) {
        return goalRepository.save(goal);
    }

    public FinancialGoal updateGoal(Long id, FinancialGoal goalData) {
        FinancialGoal goal = goalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found with id: " + id));
        goal.setGoalName(goalData.getGoalName());
        goal.setTargetAmount(goalData.getTargetAmount());
        goal.setCurrentAmount(goalData.getCurrentAmount());
        goal.setDeadline(goalData.getDeadline());
        goal.setStatus(goalData.getStatus());

        // Auto-complete if current >= target
        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus("COMPLETED");
        }

        return goalRepository.save(goal);
    }

    public FinancialGoal addToGoal(Long id, BigDecimal amount) {
        FinancialGoal goal = goalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found with id: " + id));
        goal.setCurrentAmount(goal.getCurrentAmount().add(amount));

        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus("COMPLETED");
        }

        return goalRepository.save(goal);
    }

    public void deleteGoal(Long id) {
        goalRepository.deleteById(id);
    }
}
