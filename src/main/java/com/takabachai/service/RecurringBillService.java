package com.takabachai.service;

import com.takabachai.model.RecurringBill;
import com.takabachai.repository.RecurringBillRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class RecurringBillService {

    private final RecurringBillRepository recurringBillRepository;

    public RecurringBillService(RecurringBillRepository recurringBillRepository) {
        this.recurringBillRepository = recurringBillRepository;
    }

    public List<RecurringBill> getBillsByUserId(Long userId) {
        return recurringBillRepository.findByUserId(userId);
    }

    public List<RecurringBill> getActiveBills(Long userId) {
        return recurringBillRepository.findByUserIdAndIsActive(userId, true);
    }

    public List<RecurringBill> getOverdueBills(Long userId) {
        return recurringBillRepository.findOverdueBills(userId, LocalDate.now());
    }

    public Optional<RecurringBill> getBillById(Long id) {
        return recurringBillRepository.findById(id);
    }

    public RecurringBill createBill(RecurringBill bill) {
        return recurringBillRepository.save(bill);
    }

    public RecurringBill updateBill(Long id, RecurringBill billData) {
        RecurringBill bill = recurringBillRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recurring bill not found with id: " + id));
        bill.setBillName(billData.getBillName());
        bill.setAmount(billData.getAmount());
        bill.setFrequency(billData.getFrequency());
        bill.setNextDueDate(billData.getNextDueDate());
        bill.setWalletId(billData.getWalletId());
        bill.setCategoryId(billData.getCategoryId());
        bill.setIsActive(billData.getIsActive());
        return recurringBillRepository.save(bill);
    }

    public void deleteBill(Long id) {
        recurringBillRepository.deleteById(id);
    }
}
