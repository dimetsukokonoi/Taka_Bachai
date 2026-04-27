package com.takabachai.dto;

import java.math.BigDecimal;

public interface CategoryInsightDTO {
    String getCategoryName();
    BigDecimal getUserSpending();
    BigDecimal getAverageSpending();
}
