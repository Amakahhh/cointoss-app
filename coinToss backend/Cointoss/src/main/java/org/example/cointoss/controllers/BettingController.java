// src/main/java/org/example/cointoss/controllers/BettingController.java
package org.example.cointoss.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cointoss.dtos.PlaceBetRequest;
import org.example.cointoss.entities.BettingPools;
import org.example.cointoss.repositories.BettingPoolsRepository;
import org.example.cointoss.service.BettingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bets")
@RequiredArgsConstructor
public class BettingController {

    private final BettingService bettingService;
    private final BettingPoolsRepository bettingPoolsRepository;

    @PostMapping
    public ResponseEntity<Void> placeBet(@Valid @RequestBody PlaceBetRequest request) {
        try {
            bettingService.placeBet(request.getPoolId(), request.getAmount(), request.getDirection());
            return ResponseEntity.ok().build();
        } catch (IllegalStateException | IllegalArgumentException e) {
            // Catches business logic errors (e.g., "insufficient funds") and returns a bad request status.
            return ResponseEntity.badRequest().header("X-Error-Message", e.getMessage()).build();
        }
    }


    @GetMapping("/current-pool")
    public ResponseEntity<BettingPools> getCurrentPool() {
        return bettingPoolsRepository.findFirstByStatusOrderByOpenTimeDesc("OPEN")
            .map(ResponseEntity::ok) // If a pool is found, return it with 200 OK
            .orElse(ResponseEntity.notFound().build()); // If not found, return 404 Not Found
    }

    // Temporary endpoint to create a pool for testing
    @PostMapping("/create-test-pool")
    public ResponseEntity<String> createTestPool() {
        try {
            bettingService.createNextPool();
            return ResponseEntity.ok("Test pool created successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating pool: " + e.getMessage());
        }
    }
}