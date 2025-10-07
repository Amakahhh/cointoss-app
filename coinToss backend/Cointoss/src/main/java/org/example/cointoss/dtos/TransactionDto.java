package org.example.cointoss.dtos;

import lombok.Data;
import org.example.cointoss.entities.TransactionStatus;
import org.example.cointoss.entities.TransactionType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
public class TransactionDto {
    private Long id;

    private String transactionReference;

    private TransactionType type;

    private TransactionStatus transactionStatus;

    private BigDecimal amount;

    private OffsetDateTime createdAt;

    private Long walletId;
}
