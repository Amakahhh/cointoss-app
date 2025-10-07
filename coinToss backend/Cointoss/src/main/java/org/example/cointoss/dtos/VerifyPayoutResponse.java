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
public class VerifyPayoutResponse {
    private boolean status;
    private String message;
    private DataResponse data;

    @lombok.Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataResponse {
        private String reference;

        private String status;
        private String amount;
        private Double fee;
        private String currency;
        private String narration;

        @SerializedName("completion_date")
        private String completionDate;

        private String message;
        private Customer customer;
        private String metadata;
    }

    @lombok.Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Customer {
        private String email;
        private String name;
    }
}
