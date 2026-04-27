package com.takabachai.controller;

import com.takabachai.dto.BalanceAdjustmentRequest;
import com.takabachai.model.DebtLoan;
import com.takabachai.service.DebtLoanService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/debts")
public class DebtLoanController {

    private final DebtLoanService debtLoanService;

    public DebtLoanController(DebtLoanService debtLoanService) {
        this.debtLoanService = debtLoanService;
    }

    @GetMapping("/user/{userId}")
    public List<DebtLoan> getByUser(@PathVariable Long userId) {
        return debtLoanService.getByUserId(userId);
    }

    @GetMapping("/user/{userId}/type/{type}")
    public List<DebtLoan> getByType(@PathVariable Long userId, @PathVariable String type) {
        return debtLoanService.getByUserIdAndType(userId, type.toUpperCase());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DebtLoan> getById(@PathVariable Long id) {
        return debtLoanService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public DebtLoan create(@Valid @RequestBody DebtLoan debtLoan) {
        return debtLoanService.create(debtLoan);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DebtLoan> update(@PathVariable Long id, @Valid @RequestBody DebtLoan debtLoan) {
        return ResponseEntity.ok(debtLoanService.update(id, debtLoan));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<DebtLoan> makePayment(@PathVariable Long id,
                                                @Valid @RequestBody BalanceAdjustmentRequest body) {
        return ResponseEntity.ok(debtLoanService.makePayment(id, body.getAmount()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        debtLoanService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
