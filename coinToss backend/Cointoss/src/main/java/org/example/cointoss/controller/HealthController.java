package org.example.cointoss.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/test")
    public Map<String, String> test() {
        return Map.of(
            "status", "ok",
            "message", "Cointoss backend is running!",
            "timestamp", String.valueOf(System.currentTimeMillis())
        );
    }

    @GetMapping("/status")
    public Map<String, Object> status() {
        return Map.of(
            "application", "Cointoss",
            "version", "0.0.1-SNAPSHOT",
            "status", "running",
            "database", "disabled_for_initial_deployment"
        );
    }
}