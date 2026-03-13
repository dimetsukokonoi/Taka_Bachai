package com.takabachai.controller;

import com.takabachai.service.ReportService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/user/{userId}/monthly/{month}")
    public Map<String, Object> getMonthlyReport(@PathVariable Long userId, @PathVariable String month) {
        return reportService.getMonthlyReport(userId, month);
    }
}
