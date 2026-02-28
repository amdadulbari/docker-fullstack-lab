package com.example.inventory.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Lightweight health-check endpoint that verifies the application is running and the
 * database connection is alive.
 *
 * <p>This is intentionally separate from Spring Boot Actuator's {@code /actuator/health}
 * endpoint so the project has zero additional dependencies and the response payload is
 * explicitly controlled.
 */
@RestController
@RequestMapping("/health")
@RequiredArgsConstructor
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Probes the PostgreSQL connection by executing {@code SELECT 1} and returns a JSON
     * summary of the application's health.
     *
     * <p>Response shape (healthy):
     * <pre>{@code
     * {
     *   "status":    "UP",
     *   "database":  "UP",
     *   "timestamp": "2026-02-27T12:34:56.789"
     * }
     * }</pre>
     *
     * <p>Response shape (database unreachable):
     * <pre>{@code
     * {
     *   "status":    "DOWN",
     *   "database":  "DOWN",
     *   "error":     "<exception message>",
     *   "timestamp": "2026-02-27T12:34:56.789"
     * }
     * }</pre>
     *
     * @return 200 OK when both the app and DB are healthy; 500 Internal Server Error otherwise
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("timestamp", LocalDateTime.now().toString());

        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            response.put("status", "UP");
            response.put("database", "UP");
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            response.put("status", "DOWN");
            response.put("database", "DOWN");
            response.put("error", ex.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
