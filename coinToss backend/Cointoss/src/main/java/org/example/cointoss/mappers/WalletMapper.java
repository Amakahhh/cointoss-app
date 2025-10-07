package org.example.cointoss.mappers;

import org.example.cointoss.dtos.*;
import org.example.cointoss.entities.BankAccount;
import org.example.cointoss.entities.Transaction;
import org.example.cointoss.entities.Wallet;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface WalletMapper {
    @Mapping(source = "customerName", target = "customer.name")
    @Mapping(source = "customerEmail", target = "customer.email")
    @Mapping(target = "currency", constant = "NGN")
    @Mapping(target = "merchantBearsCost", constant = "false")
    @Mapping(target = "redirectUrl", ignore = true)
    @Mapping(target = "notificationUrl", ignore = true)
    CheckoutRequest toCheckoutRequest(FundWalletRequest request);

    @Mapping(source = "wallet.id", target = "walletId")
    TransactionDto toTransactionDto(Transaction transaction);

    @Mapping(source = "wallet.id", target = "walletId")
    @Mapping(source = "id", target = "id")
    BankAccountDto toBankAccountDto(BankAccount bankAccount);

    WalletDto toWalletDto(Wallet wallet);

    @Mapping(source = "bankCode", target = "bank")
    @Mapping(source = "accountNumber", target = "account")
    @Mapping(target = "currency", constant = "NGN")
    VerifyBankAccountRequest toVerifyBankAccountRequest(CreateBankAccountRequest request);

}
