package org.example.cointoss.service;

import com.google.gson.Gson;
import lombok.RequiredArgsConstructor;
import org.example.cointoss.dtos.*;
import org.example.cointoss.entities.Transaction;
import org.example.cointoss.entities.TransactionStatus;
import org.example.cointoss.exceptions.TransactionNotFoundException;
import org.example.cointoss.exceptions.WalletNotFoundException;
import org.example.cointoss.repositories.TransactionRepository;
import org.example.cointoss.repositories.WalletRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
@RequiredArgsConstructor
public class KoraPaymentGateway implements PaymentGateway {
    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;

    @Value("${kora.secretKey}")
    private String secretKey;

    @Value("${kora.baseUrl}")
    private String baseUrl;


    @Override
    public VerifyBankAccountResponse verifyBankAccount(VerifyBankAccountRequest request) {
        try {
            String url = baseUrl + "/misc/banks/resolve";
            Gson gson = new Gson();
            String jsonRequest = gson.toJson(request);

            HttpRequest postRequest = HttpRequest.newBuilder()
                    .uri(new URI(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonRequest))
                    .build();

            HttpClient httpClient = HttpClient.newHttpClient();
            HttpResponse<String> postResponse = httpClient.send(postRequest, HttpResponse.BodyHandlers.ofString());

            var response = gson.fromJson(postResponse.body(), VerifyBankAccountResponse.class);
            return response;
        }
        catch (Exception ex) {
            System.out.println("Error: Failed to verify bank account for user.");
            System.out.println(ex.getMessage());
        }
        return null;
    }

    @Override
    public CheckoutResponse createCheckout(FundWalletRequest fundRequest) {
        try {
            String url = baseUrl + "/charges/initialize";
            CheckoutRequest request = CheckoutRequest.builder()
                    .amount(fundRequest.getAmount())
                    .reference(fundRequest.getReference())
                    .narration(fundRequest.getNarration())
                    .currency("NGN") // hardcode or set dynamically
                    .redirectUrl("https://yourapp.com/redirect") // replace with your value
                    .merchantBearsCost(false) // set based on business rule
                    .notificationUrl("https://6fa0fc6fbb68.ngrok-free.app/api/webhook/korapay") // replace with your value
                    .customer(
                            CheckoutRequest.Customer.builder()
                                    .name(fundRequest.getCustomerName())
                                    .email(fundRequest.getCustomerEmail())
                                    .build()
                    )
                    .build();
            Gson gson = new Gson();
            String jsonRequest = gson.toJson(request);
            HttpRequest postRequest = HttpRequest.newBuilder()
                    .uri(new URI(url))
                    .header("Authorization", "Bearer " + secretKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonRequest))
                    .build();
            HttpClient httpClient = HttpClient.newHttpClient();
            HttpResponse<String> postResponse = httpClient.send(postRequest, HttpResponse.BodyHandlers.ofString());

            var response = gson.fromJson(postResponse.body(), CheckoutResponse.class);
            return response;
        }
        catch (Exception ex) {
            System.out.println("Error: Failed to create checkout link for user.");
            System.out.println(ex.getMessage());
        }
        return null;
    }

    @Override
    public InitiatePayoutResponse initiatePayout(WithdrawFundRequest withdrawFundRequest) {
        try {
            String url = baseUrl + "/transactions/disburse";

            var request = InitiatePayoutRequest.builder()
                    .reference(withdrawFundRequest.getReference())
                    .destination(
                            InitiatePayoutRequest.Destination.builder()
                                    .type("bank_account")
                                    .amount(withdrawFundRequest.getAmount())
                                    .currency("NGN")
                                    .narration(withdrawFundRequest.getNarration())
                                    .bankAccount(
                                            InitiatePayoutRequest.BankAccount.builder()
                                                    .bank(withdrawFundRequest.getBankCode())
                                                    .account(withdrawFundRequest.getAccountNumber())
                                                    .build()
                                    )
                                    .customer(
                                            InitiatePayoutRequest.Customer.builder()
                                                    .name(withdrawFundRequest.getCustomerName())
                                                    .email(withdrawFundRequest.getCustomerEmail())
                                                    .build()
                                    )
                                    .build()
                    )
                    .build();

            Gson gson = new Gson();
            String jsonRequest = gson.toJson(request);
            HttpRequest postRequest = HttpRequest.newBuilder()
                    .uri(new URI(url))
                    .header("Authorization", "Bearer " + secretKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonRequest))
                    .build();
            HttpClient httpClient = HttpClient.newHttpClient();
            HttpResponse<String> postResponse = httpClient.send(postRequest, HttpResponse.BodyHandlers.ofString());

            var response = gson.fromJson(postResponse.body(), InitiatePayoutResponse.class);
            return response;
        }
        catch (Exception ex) {
            System.out.println("Error: Failed to initiate withdrawal for user.");
            System.out.println(ex.getMessage());
        }
        return null;
    }

    @Override
    public VerifyPayoutResponse verifyPayout(String transactionRef) {
        try {
            String url = baseUrl + "/transactions/disburse/" + transactionRef;

            HttpRequest postRequest = HttpRequest.newBuilder()
                    .uri(new URI(url))
                    .header("Authorization", "Bearer " + secretKey)
                    .header("Content-Type", "application/json")
                    .POST(null)
                    .build();
            Gson gson = new Gson();
            HttpClient httpClient = HttpClient.newHttpClient();
            HttpResponse<String> postResponse = httpClient.send(postRequest, HttpResponse.BodyHandlers.ofString());

            var response = gson.fromJson(postResponse.body(), VerifyPayoutResponse.class);
            return response;
        }
        catch (Exception ex) {
            System.out.println("Error: Failed to verify withdrawal for user.");
            System.out.println(ex.getMessage());
        }
        return null;
    }

    @Override
    @Transactional
    public void handleWebhook(KorapayWebhookEvent webhookEvent) {
        String reference = webhookEvent.getData().getReference();
        BigDecimal webhookAmount = webhookEvent.getData().getAmount();
        BigDecimal webhookFee = webhookEvent.getData().getFee();


        Transaction transaction = transactionRepository.findByTransactionReference(reference)
                .orElse(null);

        if (transaction == null) {
            throw new TransactionNotFoundException();
        }

        var wallet = walletRepository.findById(transaction.getWallet().getId())
                .orElse(null);

        if (wallet == null) {
            throw new WalletNotFoundException();
        }

        // ✅ Accept if webhook amount >= transaction amount
        if (transaction.getAmount() == null || webhookAmount == null) {
            transaction.setTransactionStatus(TransactionStatus.FAILED);
            transactionRepository.save(transaction);
            return;
        }

        if (webhookAmount.compareTo(transaction.getAmount()) < 0) {
            transaction.setTransactionStatus(TransactionStatus.FAILED);
            transactionRepository.save(transaction);
            return;
        }

        // Update status based on event
        if ("transfer.success".equals(webhookEvent.getEvent())) {
            var totalAmount = webhookAmount.add(webhookFee);
            wallet.withdraw(totalAmount); // get amount + transaction fee
            transaction.setTransactionStatus(TransactionStatus.SUCCESS);
        }
        else if ("charge.success".equals(webhookEvent.getEvent())) {
            wallet.deposit(transaction.getAmount());
            transaction.setTransactionStatus(TransactionStatus.SUCCESS);
        }
        else if ("transfer.failed".equals(webhookEvent.getEvent()) || "charge.failed".equals(webhookEvent.getEvent())) {
            transaction.setTransactionStatus(TransactionStatus.FAILED);
        }
        else {
            System.out.println("⚠️ Unhandled Korapay event: " + webhookEvent.getEvent());
        }
        walletRepository.save(wallet);
        transactionRepository.save(transaction);
    }}
