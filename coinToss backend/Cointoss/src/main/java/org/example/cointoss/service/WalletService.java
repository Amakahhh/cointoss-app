package org.example.cointoss.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.cointoss.dtos.*;
import org.example.cointoss.entities.BankAccount;
import org.example.cointoss.entities.Transaction;
import org.example.cointoss.entities.TransactionStatus;
import org.example.cointoss.entities.TransactionType;
import org.example.cointoss.exceptions.BankAccountExistsException;
import org.example.cointoss.exceptions.BankAccountNotFoundException;
import org.example.cointoss.exceptions.WalletNotFoundException;
import org.example.cointoss.mappers.WalletMapper;
import org.example.cointoss.repositories.WalletRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class WalletService {
    private final WalletRepository walletRepository;
    private final PaymentGateway paymentGateway;
    private final WalletMapper walletMapper;

    @Transactional
    public String fundWallet(Long walletId, BigDecimal amount) {
        var wallet = walletRepository.findById(walletId)
                .orElseThrow(WalletNotFoundException::new);

        var transaction = Transaction.builder()
                .transactionReference(Transaction.generateReference())
                .amount(amount)
                .type(TransactionType.DEPOSIT)
                .transactionStatus(TransactionStatus.PENDING)
                .build();

        wallet.addTransaction(transaction);

        walletRepository.save(wallet);

        var request = FundWalletRequest.builder()
                .amount(amount)
                .reference(transaction.getTransactionReference())
                .narration("Deposit to wallet")
                .customerEmail(wallet.getUser().getEmail())
                .customerName(wallet.getUser().getFullName())
                .build();

        var response = paymentGateway.createCheckout(request);
        if (!response.isStatus())
            return null;
        return response.getData().getCheckoutUrl();
    }

    public WalletDto getWalletWithTransactions(Long walletId) {
        var wallet = walletRepository.fetchByIdWithTransactions(walletId)
                .orElse(null);

        if (wallet == null) {
            return null;
        }
        return walletMapper.toWalletDto(wallet);
    }

    public WalletDto getWalletWithBankAccounts(Long walletId){
        var wallet = walletRepository.fetchByIdWithBankAccounts(walletId)
                .orElse(null);

        if (wallet == null) {
            return null;
        }
        return walletMapper.toWalletDto(wallet);
    }

    public BankAccountDto createBankAccount(CreateBankAccountRequest request) {
        var wallet = walletRepository.findById(request.getWalletId())
                .orElseThrow(WalletNotFoundException::new);

        var bankAccountExists = wallet.bankAccountExists(request.getAccountNumber());
        if (bankAccountExists) {
            throw new BankAccountExistsException("Bank account already exists: " + request.getAccountNumber());
        }
        var bankAccountRequest = walletMapper.toVerifyBankAccountRequest(request);
        var response = paymentGateway.verifyBankAccount(bankAccountRequest);
        if (!response.isStatus()) {
            return null;
        }
        var bankAccount = BankAccount.builder()
                .accountName(response.getData().getAccountName())
                .accountNumber(response.getData().getAccountNumber())
                .bankName(response.getData().getBankName())
                .bankCode(response.getData().getBankCode())
                .build();

        wallet.addBankAccount(bankAccount);

        walletRepository.save(wallet);
        return walletMapper.toBankAccountDto(bankAccount);
    }

    public InitiatePayoutResponse makeWithdrawal(Long walletId, Long bankAccountId, BigDecimal amount) {
        var wallet = walletRepository.fetchByIdWithBankAccounts(walletId)
                .orElseThrow(WalletNotFoundException::new);

        var bankAccount = wallet.getBankAccounts().stream()
                .filter(ba -> ba.getId().equals(bankAccountId))
                .findFirst()
                .orElse(null);

        if (bankAccount == null) {
            throw new BankAccountNotFoundException("Bank account not found: " + bankAccountId);
        }

        if (!wallet.hasSufficientBalance(amount)) {
            throw new IllegalArgumentException("Insufficient balance");
        }

        var transaction = Transaction.builder()
                .transactionReference(Transaction.generateReference())
                .amount(amount)
                .type(TransactionType.WITHDRAWAL)
                .transactionStatus(TransactionStatus.PENDING)
                .build();

        wallet.addTransaction(transaction);
        wallet.setBalance(wallet.getBalance().subtract(amount));

        walletRepository.save(wallet);

        var request = WithdrawFundRequest.builder()
                .amount(amount.toString())
                .narration("Withdrawal from wallet")
                .reference(transaction.getTransactionReference())
                .customerEmail(wallet.getUser().getEmail())
                .customerName(wallet.getUser().getFullName())
                .accountNumber(bankAccount.getAccountNumber())
                .bankCode(bankAccount.getBankCode())
                .build();

        var response = paymentGateway.initiatePayout(request);
        if (!response.isStatus())
            return null;

        return response;
    }
}
