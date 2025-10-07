package org.example.cointoss.dtos;

import java.math.BigDecimal;

import com.google.gson.annotations.SerializedName;

import lombok.Data;

@Data
public class TickerResponse {
    @SerializedName("data")
    private TickerDataWrapper data;

    @Data
    public static class TickerDataWrapper {
        @SerializedName("ticker")
        private TickerData ticker;
    }

    @Data
    public static class TickerData {
        @SerializedName("buy")
        private BigDecimal buy;

        @SerializedName("sell")
        private BigDecimal sell;

        @SerializedName("last")
        private BigDecimal lastPrice;
    }
}
