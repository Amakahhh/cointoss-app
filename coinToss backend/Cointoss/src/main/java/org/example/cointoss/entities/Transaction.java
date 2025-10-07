package org.example.cointoss.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name="transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "transaction_reference")
    private String transactionReference;

    @Column(name = "transaction_type")
    @Enumerated(EnumType.STRING)
    private TransactionType type;

    @Column(name = "transaction_status")
    @Enumerated(EnumType.STRING)
    private TransactionStatus transactionStatus;

    @Column(name = "amount", nullable = false, precision = 18, scale = 8)
    private BigDecimal amount;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    public static String generateReference() {
        // Prefix for readability (can be your app name or code)
        String prefix = "txn_";

        // Timestamp part
        String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

        // Short random string for uniqueness
        String random = UUID.randomUUID().toString().substring(0, 6);

        return prefix + timestamp + random;
    }

}
