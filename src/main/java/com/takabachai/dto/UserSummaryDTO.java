package com.takabachai.dto;

import java.math.BigDecimal;

public interface UserSummaryDTO {
    Long getId();
    String getFullName();
    String getEmail();
    String getRole();
    BigDecimal getTotalBalance();
    BigDecimal getTotalDebt();
}
