package org.example.cointoss.exceptions;

public class BankAccountExistsException extends RuntimeException {
    public BankAccountExistsException(String message) {
        super(message);
    }
}
