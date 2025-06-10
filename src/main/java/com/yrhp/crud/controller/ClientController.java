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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
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
        Client client = clientService.getClientByEmail(authentication.getName());
        List<ReviewGenerationLog> logs = logService.getLogsByCompanyName(client.getName());

        // Calculate summary metrics
        long totalReviews = logs.size();
        String avgReviewLength = logs.isEmpty() ? "N/A" : logs.stream()
                .map(ReviewGenerationLog::getReviewLength)
                .filter(length -> length != null)
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
                .max(LocalDateTime::compareTo)
                .orElse(null);

        model.addAttribute("client", client);
        model.addAttribute("logs", logs);
        model.addAttribute("totalReviews", totalReviews);
        model.addAttribute("avgReviewLength", avgReviewLength);
        model.addAttribute("lastReviewTimestamp", lastReviewTimestamp);

        return "client/clientHome";
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('CLIENT')")
    @ResponseBody
    public Client getClientProfile(Authentication authentication) {
        log.info("Fetching client profile for user: {}", authentication.getName());
        return clientService.getClientByEmail(authentication.getName());
    }

    @GetMapping("/logs")
    @PreAuthorize("hasRole('CLIENT')")
    @ResponseBody
    public List<ReviewGenerationLog> getClientLogs(Authentication authentication) {
        log.info("Fetching logs for client: {}", authentication.getName());
        Client client = clientService.getClientByEmail(authentication.getName());
        return logService.getLogsByCompanyName(client.getName());
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
        log.info("Accessing client history page for user: {}", authentication.getName());
        Client client = clientService.getClientByEmail(authentication.getName());
        Pageable pageable = PageRequest.of(page, size);

        LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate) : null;
        LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate) : null;

        // Fetch logs for the current client's companyName
        Page<ReviewGenerationLog> logs = logService.searchLogs(
                search, client.getName(), reviewLength, regenerated, keyPoints, start, end, pageable);

        model.addAttribute("client", client);
        model.addAttribute("logs", logs);
        model.addAttribute("filters", new Filters(search, client.getName(), reviewLength, regenerated, keyPoints, startDate, endDate));

        return "client/history";
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
    }
}