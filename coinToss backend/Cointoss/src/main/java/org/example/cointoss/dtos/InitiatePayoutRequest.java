package org.example.cointoss.dtos;

import com.google.gson.annotations.SerializedName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InitiatePayoutRequest {
    private String reference;
    private Destination destination;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Destination {
        private String type;
        private String amount;
        private String currency;
        private String narration;

        @SerializedName("bank_account")
        private BankAccount bankAccount;

        private Customer customer;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BankAccount {
        private String bank;
        private String account;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Customer {
        private String name;
        private String email;
    }
}
