package org.example.cointoss.exceptions;

public class WalletNotFoundException extends RuntimeException {
    public WalletNotFoundException() {
        super("Wallet not found.");
    }
}

