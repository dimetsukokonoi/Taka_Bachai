package com.takabachai.service;

import com.takabachai.exception.BadRequestException;
import com.takabachai.exception.ResourceNotFoundException;
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
        if (goal.getCurrentAmount() == null) goal.setCurrentAmount(BigDecimal.ZERO);
        if (goal.getStatus() == null || goal.getStatus().isBlank()) goal.setStatus("IN_PROGRESS");
        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus("COMPLETED");
        }
        return goalRepository.save(goal);
    }

    public FinancialGoal updateGoal(Long id, FinancialGoal goalData) {
        FinancialGoal goal = goalRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Goal", id));
        goal.setGoalName(goalData.getGoalName());
        goal.setTargetAmount(goalData.getTargetAmount());
        goal.setCurrentAmount(goalData.getCurrentAmount() != null ? goalData.getCurrentAmount() : goal.getCurrentAmount());
        goal.setDeadline(goalData.getDeadline());
        if (goalData.getStatus() != null && !goalData.getStatus().isBlank()) {
            goal.setStatus(goalData.getStatus());
        }
        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0
                && !"CANCELLED".equals(goal.getStatus())) {
            goal.setStatus("COMPLETED");
        }
        return goalRepository.save(goal);
    }

    public FinancialGoal addToGoal(Long id, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Amount must be greater than 0");
        }
        FinancialGoal goal = goalRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Goal", id));
        goal.setCurrentAmount(goal.getCurrentAmount().add(amount));
        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0
                && !"CANCELLED".equals(goal.getStatus())) {
            goal.setStatus("COMPLETED");
        }
        return goalRepository.save(goal);
    }

    public void deleteGoal(Long id) {
        if (!goalRepository.existsById(id)) {
            throw ResourceNotFoundException.of("Goal", id);
        }
        goalRepository.deleteById(id);
    }
}
