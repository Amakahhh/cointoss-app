package org.example.cointoss.dtos;

import com.google.gson.annotations.SerializedName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {
    private BigDecimal amount;

    @SerializedName("redirect_url")
    private String redirectUrl;

    private String currency;

    private String reference;

    private String narration;

    @SerializedName("merchant_bears_cost")
    private boolean merchantBearsCost;

    private Customer customer;

    @SerializedName("notification_url")
    private String notificationUrl;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Customer {
        private String name;
        private String email;
    }
}
