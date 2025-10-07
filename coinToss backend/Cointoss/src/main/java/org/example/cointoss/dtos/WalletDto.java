package org.example.cointoss.dtos;

import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Set;

@Data
public class WalletDto {
    private Long id;

    private UserDto user;

    private BigDecimal balance;

    private String currency;

    private OffsetDateTime createdAt;

    private OffsetDateTime updatedAt;

    private Set<BankAccountDto> bankAccounts;

    private Set<TransactionDto> transactions;
}
