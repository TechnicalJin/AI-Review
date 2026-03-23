package com.yrhp.crud.controller;

import com.yrhp.crud.dto.ClientPublicDTO;
import com.yrhp.crud.dto.ReviewRequest;
import com.yrhp.crud.dto.ReviewResponse;
import com.yrhp.crud.model.Client;
import com.yrhp.crud.model.ReviewGenerationLog;
import com.yrhp.crud.repository.ClientRepository;
import com.yrhp.crud.repository.ReviewGenerationLogRepository;
import com.yrhp.crud.service.ReviewGeneratorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:8080"})
public class PublicController {

    private static final Logger log = LoggerFactory.getLogger(PublicController.class);

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ReviewGeneratorService reviewGeneratorService;

    @Autowired
    private ReviewGenerationLogRepository logRepository;

    @GetMapping("/review/{clientName}")
    public ResponseEntity<?> getClientForReview(@PathVariable String clientName) {
        log.info("Fetching client info for review page: {}", clientName);

        try {
            // Find client by name
            List<Client> clients = clientRepository.findByName(clientName);

            if (clients == null || clients.isEmpty()) {
                log.warn("Client not found with name: {}", clientName);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Client not found"));
            }

            Client client = clients.get(0); // Get first match

            ClientPublicDTO dto = new ClientPublicDTO(
                    (long) client.getId(),
                    client.getName(),
                    client.getLogo() != null ? "/uploads/" + client.getLogo() : null,
                    client.getChatText(),
                    client.getReviewLink(),
                    "https://maps.google.com/?cid=" + client.getId()
            );

            log.debug("Client info retrieved successfully for: {}", clientName);
            return ResponseEntity.ok(dto);

        } catch (Exception e) {
            log.error("Error fetching client for review: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch client"));
        }
    }

    @PostMapping("/review/generate/{clientId}")
    public ResponseEntity<?> generateReview(
            @PathVariable Integer clientId,
            @RequestBody ReviewRequest request) {

        log.info("Generating review for client ID: {}", clientId);

        try {
            // Find client by ID
            Optional<Client> clientOptional = clientRepository.findById(clientId);
            if (!clientOptional.isPresent()) {
                log.warn("Client not found with ID: {}", clientId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Client not found"));
            }

            Client client = clientOptional.get();

            // Validate request
            if (request == null || request.getSelectedTags() == null || request.getSelectedTags().isEmpty()) {
                log.warn("Invalid review request: missing required fields");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Missing required fields: selectedTags"));
            }

            // Prepare params
            String tagsString = String.join(",", request.getSelectedTags());
            String reviewLength = request.getReviewLength() != null ? request.getReviewLength() : "medium";

            log.debug("Review generation params - Length: {}, Tags: {}", reviewLength, tagsString);

            // Call review generation service with tags
            String generatedReview = reviewGeneratorService.generateReviewWithTags(
                    clientId,
                    request.getSelectedTags(),
                    reviewLength
            );

            if (generatedReview == null || generatedReview.isEmpty()) {
                log.error("Review generation failed for client ID: {}", clientId);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new ErrorResponse("Failed to generate review"));
            }

            // Log the generation
            ReviewGenerationLog logEntry = new ReviewGenerationLog();
            logEntry.setCompanyName(client.getName());
            logEntry.setTimestamp(LocalDateTime.now());
            logEntry.setReviewLength(reviewLength);
            logEntry.setKeyPoints(tagsString);
            logEntry.setRegenerated("no");

            logRepository.save(logEntry);
            log.info("Review generation logged for client: {}", client.getName());

            // Extract key points from review
            List<String> keyPoints = extractKeyPoints(generatedReview);

            ReviewResponse response = new ReviewResponse(
                    generatedReview,
                    keyPoints,
                    reviewLength
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error generating review for client ID {}: {}", clientId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to generate review"));
        }
    }

    private List<String> extractKeyPoints(String review) {
        List<String> keyPoints = new ArrayList<>();

        if (review == null || review.isEmpty()) {
            return keyPoints;
        }

        // Split by sentences and take first 3
        String[] sentences = review.split("\\.");
        for (int i = 0; i < Math.min(3, sentences.length); i++) {
            String sentence = sentences[i].trim();
            if (!sentence.isEmpty()) {
                keyPoints.add(sentence);
            }
        }

        return keyPoints;
    }

    // Error response class
    public static class ErrorResponse {
        public String error;

        public ErrorResponse(String error) {
            this.error = error;
        }

        public String getError() {
            return error;
        }
    }
}