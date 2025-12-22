package com.lci.platform.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class HealthCheckController {
    @GetMapping("/api/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "version", "4.0.0", "java", "25");
    }
}
