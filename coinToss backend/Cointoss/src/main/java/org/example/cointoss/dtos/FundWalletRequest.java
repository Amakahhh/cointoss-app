package org.example.cointoss.dtos;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class FundWalletRequest {
    private BigDecimal amount;

    private String reference;

    private String narration;

    private String customerName;

    private String customerEmail;

}
