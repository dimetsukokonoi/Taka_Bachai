package com.takabachai.repository;

import com.takabachai.model.RecurringBill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RecurringBillRepository extends JpaRepository<RecurringBill, Long> {
    List<RecurringBill> findByUserId(Long userId);

    List<RecurringBill> findByUserIdAndIsActive(Long userId, Boolean isActive);

    @Query("SELECT r FROM RecurringBill r WHERE r.userId = :userId AND r.isActive = true AND r.nextDueDate <= :date")
    List<RecurringBill> findOverdueBills(@Param("userId") Long userId, @Param("date") LocalDate date);
}
