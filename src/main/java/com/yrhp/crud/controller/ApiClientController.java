package com.yrhp.crud.controller;

import com.yrhp.crud.model.Client;
import com.yrhp.crud.model.ReviewGenerationLog;
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

    // ==================== STATS ENDPOINT ====================

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(@RequestParam(required = false) String email) {
        log.info("API: Fetching client stats for email: {}", email);
        try {
            // Get all logs for now (in production, filter by client)
            List<ReviewGenerationLog> allLogs = logService.getAllLogs();

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
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String reviewLength,
            @RequestParam(required = false) String regenerated,
            @RequestParam(required = false) String email) {

        log.info("API: Fetching client history - page: {}, size: {}", page, size);
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());

            Page<ReviewGenerationLog> logsPage = logService.searchLogs(
                    search, null, reviewLength, regenerated, null, null, null, pageable);

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

    @GetMapping("/chat-text")
    public ResponseEntity<?> getChatText(@RequestParam(required = false) String email) {
        log.info("API: Fetching chat text for email: {}", email);
        try {
            if (email != null && !email.isEmpty()) {
                Client client = clientService.getClientByEmail(email);
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

    @PostMapping("/chat-text")
    public ResponseEntity<?> updateChatText(@RequestBody Map<String, String> data) {
        log.info("API: Updating chat text");
        try {
            String email = data.get("email");
            String chatText = data.get("chatText");

            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email is required"));
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
}
