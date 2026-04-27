package com.takabachai.repository;

import com.takabachai.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    @org.springframework.data.jpa.repository.Query(value = "SELECT id, full_name AS fullName, email, role, total_balance AS totalBalance, total_debt AS totalDebt " +
            "FROM vw_user_financial_summary ORDER BY id", nativeQuery = true)
    java.util.List<com.takabachai.dto.UserSummaryDTO> getUserFinancialSummaries();
}
