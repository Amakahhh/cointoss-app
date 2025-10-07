// src/main/java/org/example/cointoss/service/PriceService.java
package org.example.cointoss.service;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
public class PriceService {

    /**
     * Fetches the current price for a given crypto asset pair.
     * NOTE: For the MVP, this returns a hardcoded mock price for testing.
     * In a real application, this method would call an external API (like Quidax).
     * @param assetPair The asset pair to get the price for (e.g., "BTC/USDT").
     * @return The current price as a BigDecimal.
     */
    public BigDecimal getCurrentPrice(String assetPair) {
        // We'll simulate some slight price fluctuation for more interesting testing.
        double randomFactor = 0.99 + (Math.random() * 0.02); // Varies between 0.99 and 1.01
        BigDecimal basePrice = new BigDecimal("65000.00");
        return basePrice.multiply(BigDecimal.valueOf(randomFactor));
    }
}