package com.takabachai.repository;

import com.takabachai.model.DebtLoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DebtLoanRepository extends JpaRepository<DebtLoan, Long> {
    List<DebtLoan> findByUserId(Long userId);

    List<DebtLoan> findByUserIdAndType(Long userId, String type);

    List<DebtLoan> findByUserIdAndStatus(Long userId, String status);
}
