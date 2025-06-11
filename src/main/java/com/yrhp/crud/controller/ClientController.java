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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/client")
public class ClientController {

    private static final Logger log = LoggerFactory.getLogger(ClientController.class);

    @Autowired
    private ClientService clientService;

    @Autowired
    private ReviewGenerationLogService logService;

    @GetMapping("/home")
    @PreAuthorize("hasRole('CLIENT')")
    public String home(Model model, Authentication authentication) {
        log.info("Accessing client home page for user: {}", authentication.getName());

        try {
            Client client = clientService.getClientByEmail(authentication.getName());
            if (client == null) {
                log.error("Client not found for email: {}", authentication.getName());
                return "error/404";
            }

            List<ReviewGenerationLog> logs = logService.getLogsByCompanyName(client.getName());

            // Calculate summary metrics
            long totalReviews = logs.size();
            String avgReviewLength = logs.isEmpty() ? "N/A" : logs.stream()
                    .map(ReviewGenerationLog::getReviewLength)
                    .filter(Objects::nonNull)
                    .collect(Collectors.groupingBy(
                            length -> length,
                            Collectors.counting()
                    ))
                    .entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("N/A");

            LocalDateTime lastReviewTimestamp = logs.isEmpty() ? null : logs.stream()
                    .map(ReviewGenerationLog::getTimestamp)
                    .filter(Objects::nonNull)
                    .max(LocalDateTime::compareTo)
                    .orElse(null);

            model.addAttribute("client", client);
            model.addAttribute("logs", logs);
            model.addAttribute("totalReviews", totalReviews);
            model.addAttribute("avgReviewLength", avgReviewLength);
            model.addAttribute("lastReviewTimestamp", lastReviewTimestamp);

            return "client/clientHome";
        } catch (Exception e) {
            log.error("Error loading client home page for user: {}", authentication.getName(), e);
            return "error/500";
        }
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('CLIENT')")
    @ResponseBody
    public ResponseEntity<?> getClientProfile(Authentication authentication) {
        log.info("Fetching client profile for user: {}", authentication.getName());

        try {
            Client client = clientService.getClientByEmail(authentication.getName());
            if (client == null) {
                log.warn("Client not found for email: {}", authentication.getName());
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Client not found"));
            }

            // Create a clean response object to avoid serialization issues
            Map<String, Object> clientResponse = new HashMap<>();
            clientResponse.put("id", client.getId());
            clientResponse.put("name", client.getName());
            clientResponse.put("email", client.getEmail());
            clientResponse.put("mobile", client.getMobile());
            clientResponse.put("logo", client.getLogo());

            return ResponseEntity.ok(clientResponse);
        } catch (Exception e) {
            log.error("Error fetching client profile for user: {}", authentication.getName(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch client profile"));
        }
    }

    @GetMapping("/logs")
    @PreAuthorize("hasRole('CLIENT')")
    @ResponseBody
    public ResponseEntity<?> getClientLogs(Authentication authentication) {
        log.info("Fetching logs for client: {}", authentication.getName());

        try {
            Client client = clientService.getClientByEmail(authentication.getName());
            if (client == null) {
                log.warn("Client not found for email: {}", authentication.getName());
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Client not found"));
            }

            List<ReviewGenerationLog> logs = logService.getLogsByCompanyName(client.getName());

            // Transform logs to match frontend expectations
            List<Map<String, Object>> transformedLogs = logs.stream()
                    .map(this::transformLogToMap)
                    .collect(Collectors.toList());

            log.debug("Returning {} logs for client: {}", transformedLogs.size(), client.getName());
            return ResponseEntity.ok(transformedLogs);

        } catch (Exception e) {
            log.error("Error fetching logs for client: {}", authentication.getName(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch logs"));
        }
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('CLIENT')")
    public String clientHistory(
            Model model,
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String reviewLength,
            @RequestParam(required = false) String regenerated,
            @RequestParam(required = false) String keyPoints,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        log.info("Accessing client history page for user: {} with filters - search: {}, reviewLength: {}, regenerated: {}, keyPoints: {}, startDate: {}, endDate: {}",
                authentication.getName(), search, reviewLength, regenerated, keyPoints, startDate, endDate);

        try {
            Client client = clientService.getClientByEmail(authentication.getName());
            if (client == null) {
                log.error("Client not found for email: {}", authentication.getName());
                return "error/404";
            }

            // Create pageable with sorting by timestamp descending
            Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());

            LocalDateTime start = null;
            LocalDateTime end = null;

            // Parse date strings safely
            try {
                if (startDate != null && !startDate.trim().isEmpty()) {
                    start = LocalDateTime.parse(startDate);
                }
                if (endDate != null && !endDate.trim().isEmpty()) {
                    end = LocalDateTime.parse(endDate);
                }
            } catch (DateTimeParseException e) {
                log.warn("Error parsing date parameters: startDate={}, endDate={}", startDate, endDate, e);
            }

            // Convert empty strings to null for proper filtering
            String searchParam = (search != null && search.trim().isEmpty()) ? null : search;
            String reviewLengthParam = (reviewLength != null && reviewLength.trim().isEmpty()) ? null : reviewLength;
            String regeneratedParam = (regenerated != null && regenerated.trim().isEmpty()) ? null : regenerated;
            String keyPointsParam = (keyPoints != null && keyPoints.trim().isEmpty()) ? null : keyPoints;

            // Fetch logs for the current client's companyName
            Page<ReviewGenerationLog> logs = logService.searchLogs(
                    searchParam, client.getName(), reviewLengthParam, regeneratedParam, keyPointsParam, start, end, pageable);

            // Add distinct company names for the dropdown
            List<String> distinctCompanies = logService.getDistinctCompanyNames();

            model.addAttribute("client", client);
            model.addAttribute("logs", logs);
            model.addAttribute("filters", new Filters(search, client.getName(), reviewLength, regenerated, keyPoints, startDate, endDate));
            model.addAttribute("distinctCompanies", distinctCompanies);

            log.debug("Returning {} logs for client history", logs.getTotalElements());
            return "client/history";

        } catch (Exception e) {
            log.error("Error loading client history for user: {}", authentication.getName(), e);
            return "error/500";
        }
    }

    /**
     * Transform ReviewGenerationLog entity to Map for JSON serialization
     * This ensures consistent data format for the frontend
     */
    private Map<String, Object> transformLogToMap(ReviewGenerationLog log) {
        Map<String, Object> logMap = new HashMap<>();

        logMap.put("id", log.getId());
        logMap.put("companyName", log.getCompanyName());
        logMap.put("reviewLength", log.getReviewLength());
        logMap.put("keyPoints", log.getKeyPoints());
        logMap.put("regenerated", log.getRegenerated());

        // Handle timestamp serialization properly
        if (log.getTimestamp() != null) {
            // Option 1: ISO String format (recommended)
            logMap.put("timestamp", log.getTimestamp().toString());

            // Option 2: If your frontend expects array format, uncomment below:
            // LocalDateTime timestamp = log.getTimestamp();
            // logMap.put("timestamp", Arrays.asList(
            //     timestamp.getYear(),
            //     timestamp.getMonthValue(),
            //     timestamp.getDayOfMonth(),
            //     timestamp.getHour(),
            //     timestamp.getMinute(),
            //     timestamp.getSecond()
            // ));
        } else {
            logMap.put("timestamp", null);
        }

        // Add any other fields from your ReviewGenerationLog entity
        // that the frontend might need

        return logMap;
    }

    // Helper class to store filter parameters
    public static class Filters {
        private String search;
        private String company;
        private String reviewLength;
        private String regenerated;
        private String keyPoints;
        private String startDate;
        private String endDate;

        public Filters(String search, String company, String reviewLength, String regenerated, String keyPoints, String startDate, String endDate) {
            this.search = search;
            this.company = company;
            this.reviewLength = reviewLength;
            this.regenerated = regenerated;
            this.keyPoints = keyPoints;
            this.startDate = startDate;
            this.endDate = endDate;
        }

        // Getters
        public String getSearch() { return search; }
        public String getCompany() { return company; }
        public String getReviewLength() { return reviewLength; }
        public String getRegenerated() { return regenerated; }
        public String getKeyPoints() { return keyPoints; }
        public String getStartDate() { return startDate; }
        public String getEndDate() { return endDate; }

        // Setters (if needed)
        public void setSearch(String search) { this.search = search; }
        public void setCompany(String company) { this.company = company; }
        public void setReviewLength(String reviewLength) { this.reviewLength = reviewLength; }
        public void setRegenerated(String regenerated) { this.regenerated = regenerated; }
        public void setKeyPoints(String keyPoints) { this.keyPoints = keyPoints; }
        public void setStartDate(String startDate) { this.startDate = startDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }
    }
}