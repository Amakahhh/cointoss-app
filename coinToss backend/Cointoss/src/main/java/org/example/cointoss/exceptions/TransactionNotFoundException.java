package org.example.cointoss.exceptions;

public class TransactionNotFoundException extends RuntimeException {
    public TransactionNotFoundException() {
        super("Transaction not found");
    }
}
