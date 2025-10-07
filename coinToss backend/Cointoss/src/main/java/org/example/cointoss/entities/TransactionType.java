package org.example.cointoss.entities;

public enum TransactionType {
    DEBIT,       // funds deducted (e.g., placing a bet)
    CREDIT,      // funds added (e.g., winnings)
    REFUND,      // bet refunded (e.g., cycle canceled or push)
    DEPOSIT,
    WITHDRAWAL
}
