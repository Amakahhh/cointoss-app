package org.example.cointoss.dtos;

import lombok.Data;

@Data
public class CreateBankAccountRequest {
    private String bankCode;

    private String accountNumber;

    private Long walletId;
    //it is NGN by default
}
