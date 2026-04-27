package com.takabachai.service;

import com.takabachai.exception.BadRequestException;
import com.takabachai.exception.ResourceNotFoundException;
import com.takabachai.model.DebtLoan;
import com.takabachai.repository.DebtLoanRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class DebtLoanService {

    private final DebtLoanRepository debtLoanRepository;

    public DebtLoanService(DebtLoanRepository debtLoanRepository) {
        this.debtLoanRepository = debtLoanRepository;
    }

    public List<DebtLoan> getByUserId(Long userId) {
        return debtLoanRepository.findByUserId(userId);
    }

    public List<DebtLoan> getByUserIdAndType(Long userId, String type) {
        return debtLoanRepository.findByUserIdAndType(userId, type);
    }

    public Optional<DebtLoan> getById(Long id) {
        return debtLoanRepository.findById(id);
    }

    public DebtLoan create(DebtLoan debtLoan) {
        if (debtLoan.getRemainingAmount() == null) {
            debtLoan.setRemainingAmount(debtLoan.getAmount());
        }
        if (debtLoan.getRemainingAmount().compareTo(debtLoan.getAmount()) > 0) {
            throw new BadRequestException("Remaining amount cannot exceed total amount");
        }
        if (debtLoan.getStatus() == null || debtLoan.getStatus().isBlank()) {
            debtLoan.setStatus(debtLoan.getRemainingAmount().compareTo(BigDecimal.ZERO) == 0 ? "PAID" : "PENDING");
        }
        return debtLoanRepository.save(debtLoan);
    }

    public DebtLoan update(Long id, DebtLoan data) {
        DebtLoan debtLoan = debtLoanRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Debt/Loan", id));
        debtLoan.setType(data.getType());
        debtLoan.setPersonName(data.getPersonName());
        debtLoan.setAmount(data.getAmount());
        BigDecimal remaining = data.getRemainingAmount() != null ? data.getRemainingAmount() : debtLoan.getRemainingAmount();
        if (remaining.compareTo(data.getAmount()) > 0) {
            throw new BadRequestException("Remaining amount cannot exceed total amount");
        }
        debtLoan.setRemainingAmount(remaining);
        debtLoan.setDescription(data.getDescription());
        debtLoan.setDueDate(data.getDueDate());
        if (data.getStatus() != null && !data.getStatus().isBlank()) {
            debtLoan.setStatus(data.getStatus());
        }
        return debtLoanRepository.save(debtLoan);
    }

    public DebtLoan makePayment(Long id, BigDecimal paymentAmount) {
        if (paymentAmount == null || paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than 0");
        }
        DebtLoan debtLoan = debtLoanRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Debt/Loan", id));
        if (paymentAmount.compareTo(debtLoan.getRemainingAmount()) > 0) {
            throw new BadRequestException("Payment exceeds remaining amount");
        }
        BigDecimal newRemaining = debtLoan.getRemainingAmount().subtract(paymentAmount);
        if (newRemaining.compareTo(BigDecimal.ZERO) <= 0) {
            debtLoan.setRemainingAmount(BigDecimal.ZERO);
            debtLoan.setStatus("PAID");
        } else {
            debtLoan.setRemainingAmount(newRemaining);
            debtLoan.setStatus("PARTIALLY_PAID");
        }
        return debtLoanRepository.save(debtLoan);
    }

    public void delete(Long id) {
        if (!debtLoanRepository.existsById(id)) {
            throw ResourceNotFoundException.of("Debt/Loan", id);
        }
        debtLoanRepository.deleteById(id);
    }
}
