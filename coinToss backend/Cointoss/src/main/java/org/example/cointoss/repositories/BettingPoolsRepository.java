// src/main/java/org/example/cointoss/repositories/BettingPoolsRepository.java
package org.example.cointoss.repositories;

import org.example.cointoss.entities.BettingPools;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface BettingPoolsRepository extends JpaRepository<BettingPools, Long> {
    // This custom query will help us find the latest pool that is currently open for betting.
    Optional<BettingPools> findFirstByStatusOrderByOpenTimeDesc(String status);

    List<BettingPools> findAllByStatusAndLockTimeBefore(String status, OffsetDateTime time);
    List<BettingPools> findAllByStatusAndSettlementTimeBefore(String status, OffsetDateTime time);

}