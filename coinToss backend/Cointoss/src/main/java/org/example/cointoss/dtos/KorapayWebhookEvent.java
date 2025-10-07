package org.example.cointoss.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KorapayWebhookEvent {
    private String event;
    private WebhookData data;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WebhookData {
        private BigDecimal fee;
        private BigDecimal amount;
        private String status;
        private String currency;
        private String reference;
        private String payment_method;     // for charge events
        private String payment_reference;  // for charge events
    }
}
