package org.example.cointoss.dtos;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DepositFundRequest {
    private BigDecimal amount;
}
