package org.example.cointoss.repositories;

import org.example.cointoss.entities.Transaction;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface TransactionRepository extends CrudRepository<Transaction, Long> {
    Optional<Transaction> findByTransactionReference(String reference);
}
