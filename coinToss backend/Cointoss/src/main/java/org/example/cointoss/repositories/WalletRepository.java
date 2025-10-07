// src/main/java/org/example/cointoss/repositories/WalletRepository.java
package org.example.cointoss.repositories;

import org.example.cointoss.entities.Wallet;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Long> {
    // A crucial method to find a wallet by its user's ID.
    Optional<Wallet> findByUserId(Long userId);
    @EntityGraph(attributePaths = "transactions")
    @Query("SELECT w FROM Wallet w WHERE w.id = :walletId")
    Optional<Wallet> fetchByIdWithTransactions(Long walletId);

    @EntityGraph(attributePaths = "bankAccounts")
    @Query("SELECT w FROM Wallet w WHERE w.id = :walletId")
    Optional<Wallet> fetchByIdWithBankAccounts(Long walletId);

}