package com.takabachai.repository;

import com.takabachai.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    @org.springframework.data.jpa.repository.Query(value = "SELECT u.id AS id, u.full_name AS fullName, u.email AS email, u.role AS role, " +
            "COALESCE(w_agg.total_balance, 0) AS totalBalance, " +
            "COALESCE(d_agg.total_debt, 0) AS totalDebt " +
            "FROM users u " +
            "LEFT OUTER JOIN (SELECT user_id, SUM(balance) as total_balance FROM wallets GROUP BY user_id) w_agg ON u.id = w_agg.user_id " +
            "LEFT OUTER JOIN (SELECT user_id, SUM(amount) as total_debt FROM debts_loans GROUP BY user_id) d_agg ON u.id = d_agg.user_id " +
            "ORDER BY u.id", nativeQuery = true)
    java.util.List<com.takabachai.dto.UserSummaryDTO> getUserFinancialSummaries();
}
