package org.example.cointoss.controllers;

import lombok.RequiredArgsConstructor;
import org.example.cointoss.dtos.*;
import org.example.cointoss.exceptions.BankAccountExistsException;
import org.example.cointoss.exceptions.BankAccountNotFoundException;
import org.example.cointoss.exceptions.WalletNotFoundException;
import org.example.cointoss.service.PaymentGateway;
import org.example.cointoss.service.WalletService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/wallets")
@RequiredArgsConstructor
public class WalletController {
    private final WalletService walletService;
    private final PaymentGateway paymentGateway;
    @PostMapping("/{walletId}/fund")
    public ResponseEntity<String> fundWallet(
            @PathVariable(name = "walletId") Long walletId,
            @RequestBody DepositFundRequest request) {
        String checkoutUrl = walletService.fundWallet(walletId, request.getAmount());
        if (checkoutUrl == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to create checkout");
        }
        return ResponseEntity.ok(checkoutUrl);
    }

    @GetMapping("/{walletId}/transactions")
    public ResponseEntity<WalletDto> getWalletWithTransactions(@PathVariable Long walletId) {
        var walletDto = walletService.getWalletWithTransactions(walletId);
        if (walletDto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(walletDto);
    }

    @GetMapping("/{walletId}/bank-accounts")
    public ResponseEntity<WalletDto> getWalletWithBankAccounts(@PathVariable Long walletId) {
        var walletDto = walletService.getWalletWithBankAccounts(walletId);
        if (walletDto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(walletDto);
    }

    @PostMapping("/{walletId}/bank-accounts")
    public ResponseEntity<BankAccountDto> createBankAccount(
            @RequestBody CreateBankAccountRequest request) {
        var bankAccountDto = walletService.createBankAccount(request);
        if (bankAccountDto == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(bankAccountDto);
    }

    @PostMapping("/{walletId}/withdraw")
    public ResponseEntity<InitiatePayoutResponse> withdraw(
            @PathVariable Long walletId,
            @RequestParam Long bankAccountId,
            @RequestParam BigDecimal amount) {
        var response = walletService.makeWithdrawal(walletId, bankAccountId, amount);
        if (response == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-payout/{transactionRef}")
    public ResponseEntity<VerifyPayoutResponse> verifyPayout(
            @PathVariable("transactionRef") String transactionRef) {
        var response = paymentGateway.verifyPayout(transactionRef);
        if (response == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        return ResponseEntity.ok(response);
    }


    /* ----------------- Exception Handlers ----------------- */

    @ExceptionHandler(WalletNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleWalletNotFound() {
        return ResponseEntity.status((HttpStatus.NOT_FOUND)).body(
                Map.of("error", "Wallet not found.")
        );

    }

    @ExceptionHandler(BankAccountExistsException.class)
    public ResponseEntity<Map<String, String>> handleBankAccountExists(BankAccountExistsException ex) {
        return ResponseEntity.status((HttpStatus.NOT_FOUND)).body(
                Map.of("error", ex.getMessage())
        );
    }

    @ExceptionHandler(BankAccountNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleBankAccountExists(BankAccountNotFoundException ex) {
        return ResponseEntity.status((HttpStatus.NOT_FOUND)).body(
                Map.of("error", ex.getMessage())
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status((HttpStatus.BAD_REQUEST)).body(
                Map.of("error", ex.getMessage())
        );
    }



}

