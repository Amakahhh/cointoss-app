package org.example.cointoss.scheduler;

import lombok.RequiredArgsConstructor;
import org.example.cointoss.service.BettingService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class GameCycleScheduler {

    private final BettingService bettingService;

    /**
     * This scheduled job creates a new betting pool every 30 seconds for testing.
     * In production, this should be every 10 minutes
     */
    @Scheduled(fixedRate = 30000) // Every 30 seconds for testing
    public void schedulePoolCreation() {
        System.out.println("SCHEDULER: Running job to create a new betting pool...");
        bettingService.createNextPool();
    }

    /**
     * This scheduled job runs every 30 seconds to check the status of pools.
     * It looks for pools that need to be locked or settled and processes them.
     */
    @Scheduled(fixedRate = 30000)
    public void schedulePoolUpdates() {
        System.out.println("SCHEDULER: Running job to check for pools to lock or settle...");
        bettingService.lockDuePools();
        bettingService.settleDuePools();
    }
}