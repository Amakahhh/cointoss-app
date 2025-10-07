package org.example.cointoss.dtos;

import lombok.Data;

@Data
public class BankAccountDto {
    private Long id;

    private String accountNumber;

    private String bankCode;

    private String accountName;

    private Long walletId;
}
