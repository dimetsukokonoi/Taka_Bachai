package com.takabachai.controller;

import com.takabachai.model.RecurringBill;
import com.takabachai.service.RecurringBillService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recurring-bills")
@CrossOrigin(origins = "*")
public class RecurringBillController {

    private final RecurringBillService billService;

    public RecurringBillController(RecurringBillService billService) {
        this.billService = billService;
    }

    @GetMapping("/user/{userId}")
    public List<RecurringBill> getBillsByUser(@PathVariable Long userId) {
        return billService.getBillsByUserId(userId);
    }

    @GetMapping("/user/{userId}/active")
    public List<RecurringBill> getActiveBills(@PathVariable Long userId) {
        return billService.getActiveBills(userId);
    }

    @GetMapping("/user/{userId}/overdue")
    public List<RecurringBill> getOverdueBills(@PathVariable Long userId) {
        return billService.getOverdueBills(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecurringBill> getBillById(@PathVariable Long id) {
        return billService.getBillById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public RecurringBill createBill(@Valid @RequestBody RecurringBill bill) {
        return billService.createBill(bill);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecurringBill> updateBill(@PathVariable Long id, @Valid @RequestBody RecurringBill bill) {
        return ResponseEntity.ok(billService.updateBill(id, bill));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBill(@PathVariable Long id) {
        billService.deleteBill(id);
        return ResponseEntity.noContent().build();
    }
}
