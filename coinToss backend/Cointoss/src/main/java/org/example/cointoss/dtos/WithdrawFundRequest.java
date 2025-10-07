package org.example.cointoss.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WithdrawFundRequest {
    private String reference;

    private String amount;

    private String narration;

    private String bankCode;

    private String accountNumber;

    private String customerName;

    private String customerEmail;
}
