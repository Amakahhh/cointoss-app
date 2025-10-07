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
public class CheckoutResponse {
    private boolean status;
    private DataObj data;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataObj {

        private String reference;

        @SerializedName("checkout_url")
        private String checkoutUrl;
    }
}
