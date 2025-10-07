package org.example.cointoss.controllers;

import lombok.RequiredArgsConstructor;
import org.example.cointoss.repositories.UserRepository;
import org.example.cointoss.scheduler.GameCycleScheduler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/debug")
@RequiredArgsConstructor
public class DebugController {
    private final GameCycleScheduler scheduler;
    private final UserRepository userRepository;

    @GetMapping("/health")
    public Map<String, Object> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("database", "Connected");
        response.put("userCount", userRepository.count());
        return response;
    }

    @PostMapping("/trigger-creation")
    public void triggerCreation() {
        scheduler.schedulePoolCreation();
    }

    @PostMapping("/trigger-updates")
    public void triggerUpdates() {
        scheduler.schedulePoolUpdates();
    }
}