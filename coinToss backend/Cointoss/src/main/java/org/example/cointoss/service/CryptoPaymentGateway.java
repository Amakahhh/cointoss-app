package org.example.cointoss.service;

import org.example.cointoss.dtos.TickerResponse;

public interface CryptoPaymentGateway {
    TickerResponse getBuyPrice(String marketPair);
}
