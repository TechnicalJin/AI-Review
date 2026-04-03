package com.yrhp.crud.controller;

import com.yrhp.crud.model.Client;
import com.yrhp.crud.model.ReviewGenerationLog;
import com.yrhp.crud.service.ApiTokenService;
import com.yrhp.crud.service.ClientService;
import com.yrhp.crud.service.ReviewGenerationLogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/client")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class ApiClientController {

    private static final Logger log = LoggerFactory.getLogger(ApiClientController.class);

    @Autowired
    private ClientService clientService;

    @Autowired
    private ReviewGenerationLogService logService;

    @Autowired
    private ApiTokenService apiTokenService;

    // ==================== STATS ENDPOINT ====================

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            Authentication authentication) {
        Optional<String> email = resolveCurrentClientEmail(authHeader, authentication);
        if (email.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized client request"));
        }

        log.info("API: Fetching client stats for email: {}", email.get());
        try {
            Client client = clientService.getClientByEmail(email.get());
            List<ReviewGenerationLog> allLogs = logService.getLogsByCompanyName(client.getName());

            // Calculate stats
            long totalReviews = allLogs.size();
            long regeneratedCount = allLogs.stream()
                    .filter(l -> "Yes".equalsIgnoreCase(l.getRegenerated()))
                    .count();

            // Calculate weekly and monthly stats
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime weekAgo = now.minusWeeks(1);
            LocalDateTime monthAgo = now.minusMonths(1);

            long weeklyReviews = allLogs.stream()
                    .filter(l -> l.getTimestamp() != null && l.getTimestamp().isAfter(weekAgo))
                    .count();

            long monthlyReviews = allLogs.stream()
                    .filter(l -> l.getTimestamp() != null && l.getTimestamp().isAfter(monthAgo))
                    .count();

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalReviews", totalReviews);
            stats.put("thisWeek", weeklyReviews);
            stats.put("thisMonth", monthlyReviews);
            stats.put("regenerated", regeneratedCount);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("API: Error fetching stats: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch stats: " + e.getMessage()));
        }
    }

    // ==================== HISTORY ENDPOINT ====================

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String reviewLength,
            @RequestParam(required = false) String regenerated,
            @RequestParam(required = false) String keyPoints,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        Optional<String> email = resolveCurrentClientEmail(authHeader, authentication);
        if (email.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized client request"));
        }

        log.info("API: Fetching client history - page: {}, size: {}", page, size);
        try {
            Client client = clientService.getClientByEmail(email.get());
            Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());

            LocalDateTime start = parseDateTime(startDate);
            LocalDateTime end = parseDateTime(endDate);

            Page<ReviewGenerationLog> logsPage = logService.searchLogs(
                    search, client.getName(), reviewLength, regenerated, keyPoints, start, end, pageable);

            List<Map<String, Object>> logsList = logsPage.getContent().stream()
                    .map(this::transformLogToMap)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("content", logsList);
            response.put("totalElements", logsPage.getTotalElements());
            response.put("totalPages", logsPage.getTotalPages());
            response.put("currentPage", logsPage.getNumber());
            response.put("size", logsPage.getSize());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("API: Error fetching history: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch history: " + e.getMessage()));
        }
    }

    // ==================== CHAT TEXT ENDPOINTS ====================

    @GetMapping({"/chat-text", "/chatText"})
    public ResponseEntity<?> getChatText(Authentication authentication,
                         @RequestHeader(value = "Authorization", required = false) String authHeader,
                                         @RequestParam(required = false) String email) {
        String resolvedEmail = resolveCurrentClientEmail(authHeader, authentication).orElse(null);

        log.info("API: Fetching chat text for email: {}", resolvedEmail);
        try {
            if (resolvedEmail != null && !resolvedEmail.isEmpty()) {
                Client client = clientService.getClientByEmail(resolvedEmail);
                return ResponseEntity.ok(Map.of(
                        "chatText", client.getChatText() != null ? client.getChatText() : "",
                        "clientId", client.getId(),
                        "clientName", client.getName()
                ));
            }

            // If no email, return empty
            return ResponseEntity.ok(Map.of("chatText", "", "message", "No email provided"));
        } catch (Exception e) {
            log.error("API: Error fetching chat text: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch chat text: " + e.getMessage()));
        }
    }

    @PostMapping({"/chat-text", "/chatText"})
    public ResponseEntity<?> updateChatText(Authentication authentication,
                                            @RequestHeader(value = "Authorization", required = false) String authHeader,
                                            @RequestBody Map<String, String> data) {
        log.info("API: Updating chat text");
        try {
            String email = resolveCurrentClientEmail(authHeader, authentication).orElse(null);
            String chatText = data.get("chatText");

            if (email == null || email.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Unauthorized client request"));
            }

            Client client = clientService.getClientByEmail(email);
            client.setChatText(chatText);
            clientService.saveClient(client);

            log.info("API: Chat text updated successfully for: {}", email);
            return ResponseEntity.ok(Map.of(
                    "message", "Chat text updated successfully",
                    "chatText", chatText
            ));
        } catch (Exception e) {
            log.error("API: Error updating chat text: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Failed to update chat text: " + e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getClientProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            Authentication authentication) {
        Optional<String> email = resolveCurrentClientEmail(authHeader, authentication);
        if (email.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized client request"));
        }

        try {
            Client client = clientService.getClientByEmail(email.get());
            return ResponseEntity.ok(Map.of(
                    "id", client.getId(),
                    "name", client.getName(),
                    "email", client.getEmail(),
                    "mobile", client.getMobile(),
                    "logo", client.getLogo() != null ? client.getLogo() : ""
            ));
        } catch (Exception e) {
            log.error("API: Error fetching client profile: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch client profile"));
        }
    }

    @GetMapping("/logs")
    public ResponseEntity<?> getClientLogs(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            Authentication authentication) {
        Optional<String> email = resolveCurrentClientEmail(authHeader, authentication);
        if (email.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized client request"));
        }

        try {
            Client client = clientService.getClientByEmail(email.get());
            List<Map<String, Object>> logs = logService.getLogsByCompanyName(client.getName())
                    .stream()
                    .map(this::transformLogToMap)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            log.error("API: Error fetching client logs: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch client logs"));
        }
    }

    // ==================== HELPER METHODS ====================

    private Map<String, Object> transformLogToMap(ReviewGenerationLog log) {
        Map<String, Object> logMap = new HashMap<>();
        logMap.put("id", log.getId());
        logMap.put("companyName", log.getCompanyName());
        logMap.put("reviewLength", log.getReviewLength());
        logMap.put("keyPoints", log.getKeyPoints());
        logMap.put("regenerated", log.getRegenerated());

        if (log.getTimestamp() != null) {
            logMap.put("timestamp", log.getTimestamp().toString());
        } else {
            logMap.put("timestamp", null);
        }

        return logMap;
    }

    private Optional<String> resolveCurrentClientEmail(String authHeader, Authentication authentication) {
        Optional<String> emailFromToken = apiTokenService.resolveEmail(authHeader);
        if (emailFromToken.isPresent()) {
            return emailFromToken;
        }

        if (authentication != null && authentication.getName() != null && !authentication.getName().isBlank()) {
            return Optional.of(authentication.getName());
        }

        return Optional.empty();
    }

    private LocalDateTime parseDateTime(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        try {
            return LocalDateTime.parse(value.trim());
        } catch (Exception e) {
            log.warn("API: Ignoring invalid datetime parameter: {}", value);
            return null;
        }
    }
}
