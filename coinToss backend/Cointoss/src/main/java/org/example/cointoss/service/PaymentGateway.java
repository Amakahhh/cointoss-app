package org.example.cointoss.service;

import org.example.cointoss.dtos.*;

public interface PaymentGateway {
    VerifyBankAccountResponse verifyBankAccount(
            VerifyBankAccountRequest request);

    CheckoutResponse createCheckout(
            FundWalletRequest request);

    InitiatePayoutResponse initiatePayout(
            WithdrawFundRequest withdrawFundRequest);

    VerifyPayoutResponse verifyPayout(
            String transactionRef);

    void handleWebhook(KorapayWebhookEvent webhookEvent);
}
