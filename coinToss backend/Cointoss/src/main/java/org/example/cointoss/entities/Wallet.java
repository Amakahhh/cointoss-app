package org.example.cointoss.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name="wallets")
public class Wallet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "balance", nullable = false, precision = 10, scale = 2)
    private BigDecimal balance = new BigDecimal("100.00");

    @Column(name = "currency", nullable = false, length = 10)
    private String currency = "NGN";

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "wallet", cascade =  CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<BankAccount> bankAccounts = new HashSet<>();

    @OneToMany(mappedBy = "wallet", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Transaction> transactions = new HashSet<>();

    public void addTransaction(Transaction transaction) {
        transactions.add(transaction);
        transaction.setWallet(this);
    }

    public void removeTransaction(Transaction transaction) {
        transactions.remove(transaction);
        transaction.setWallet(null);
    }

    public void addBankAccount(BankAccount bankAccount) {
        bankAccounts.add(bankAccount);
        bankAccount.setWallet(this);
    }

    public void removeBankAccount(BankAccount bankAccount) {
        bankAccounts.remove(bankAccount);
        bankAccount.setWallet(null);
    }

    public boolean bankAccountExists(String accountNumber) {
        return bankAccounts.stream()
                .anyMatch(account ->
                        account.getAccountNumber().equals(accountNumber));
    }

    public void deposit(BigDecimal amount) {
        balance = balance.add(amount);
    }

    public void withdraw(BigDecimal amount) {
        balance = balance.subtract(amount);
    }
    public boolean hasSufficientBalance(BigDecimal amount) {
        return balance.compareTo(amount) >= 0;
    }
}
