// src/main/java/org/example/cointoss/repositories/BetsRepository.java
package org.example.cointoss.repositories;

import org.example.cointoss.entities.Bets;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BetsRepository extends JpaRepository<Bets, Long> {
    // We can add methods to find bets by user, etc., later.
    List<Bets> findAllByPoolId(Long poolId);
}