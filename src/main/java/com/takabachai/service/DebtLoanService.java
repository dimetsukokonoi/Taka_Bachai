package com.takabachai.service;

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
        return debtLoanRepository.save(debtLoan);
    }

    public DebtLoan update(Long id, DebtLoan data) {
        DebtLoan debtLoan = debtLoanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Debt/Loan not found with id: " + id));
        debtLoan.setType(data.getType());
        debtLoan.setPersonName(data.getPersonName());
        debtLoan.setAmount(data.getAmount());
        debtLoan.setRemainingAmount(data.getRemainingAmount());
        debtLoan.setDescription(data.getDescription());
        debtLoan.setDueDate(data.getDueDate());
        debtLoan.setStatus(data.getStatus());
        return debtLoanRepository.save(debtLoan);
    }

    public DebtLoan makePayment(Long id, BigDecimal paymentAmount) {
        DebtLoan debtLoan = debtLoanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Debt/Loan not found with id: " + id));
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
        debtLoanRepository.deleteById(id);
    }
}
