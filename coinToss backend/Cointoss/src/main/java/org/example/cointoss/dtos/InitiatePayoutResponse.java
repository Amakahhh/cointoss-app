package org.example.cointoss.dtos;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InitiatePayoutResponse {

    private boolean status;
    private DataObj data;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataObj {
        private String amount;
        private String fee;
        private String currency;
        private String status;
        private String reference;
        private String message;
        private Customer customer;
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
