package com.yrhp.crud.controller;

import com.yrhp.crud.model.Client;
import com.yrhp.crud.model.ReviewGenerationLog;
import com.yrhp.crud.model.UserDtls;
import com.yrhp.crud.repository.UserRepository;
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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class ApiUserController {

    private static final Logger log = LoggerFactory.getLogger(ApiUserController.class);

    @Autowired
    private ClientService clientService;

    @Autowired
    private ReviewGenerationLogService logService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ==================== CLIENT ENDPOINTS ====================

    @GetMapping("/clients")
    public ResponseEntity<?> getAllClients() {
        log.info("API: Fetching all clients");
        try {
            List<Client> clients = clientService.getAllClients();

            // Transform to exclude sensitive data like password
            List<Map<String, Object>> clientList = clients.stream()
                    .map(this::transformClientToMap)
                    .collect(Collectors.toList());

            log.info("API: Returning {} clients", clientList.size());
            return ResponseEntity.ok(clientList);
        } catch (Exception e) {
            log.error("API: Error fetching clients: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch clients: " + e.getMessage()));
        }
    }

    @GetMapping("/clients/{id}")
    public ResponseEntity<?> getClientById(@PathVariable int id) {
        log.info("API: Fetching client with ID: {}", id);
        try {
            Client client = clientService.getClientById(id);
            return ResponseEntity.ok(transformClientToMap(client));
        } catch (Exception e) {
            log.error("API: Error fetching client {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Client not found"));
        }
    }

    // JSON-based create client (backward compatibility)
    @PostMapping(value = "/clients", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createClientJson(@RequestBody Map<String, Object> clientData) {
        log.info("API: Creating new client (JSON)");
        try {
            Client client = new Client();
            client.setName((String) clientData.get("name"));
            client.setEmail((String) clientData.get("email"));
            client.setMobile((String) clientData.get("mobile"));
            client.setReviewLink((String) clientData.get("reviewLink"));
            client.setChatText((String) clientData.get("chatText"));

            // Set password if provided
            String password = (String) clientData.get("password");
            if (password != null && !password.isEmpty()) {
                client.setPassword(passwordEncoder.encode(password));
            } else {
                // Default password
                client.setPassword(passwordEncoder.encode("defaultPass123"));
            }

            client.setRole("ROLE_CLIENT");
            client.setGenerateLink("/user/view/" + client.getName().replaceAll("\\s", "-").toLowerCase());

            Client savedClient = clientService.saveClient(client);
            log.info("API: Client created successfully with ID: {}", savedClient.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(transformClientToMap(savedClient));
        } catch (Exception e) {
            log.error("API: Error creating client: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Failed to create client: " + e.getMessage()));
        }
    }

    // Multipart form-data create client (with file upload)
    @PostMapping(value = "/clients", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createClientMultipart(
            @RequestParam("name") String name,
            @RequestParam("email") String email,
            @RequestParam(value = "password", required = false) String password,
            @RequestParam("mobile") String mobile,
            @RequestParam("reviewLink") String reviewLink,
            @RequestParam("chatText") String chatText,
            @RequestParam(value = "logo", required = false) MultipartFile logo) {

        log.info("API: Creating new client (Multipart)");
        try {
            Client client = new Client();
            client.setName(name);
            client.setEmail(email);
            client.setMobile(mobile);
            client.setReviewLink(reviewLink);
            client.setChatText(chatText);

            // Handle logo upload
            if (logo != null && !logo.isEmpty()) {
                String fileName = saveUploadedFile(logo);
                client.setLogo(fileName);
            }

            // Set password
            if (password != null && !password.isEmpty()) {
                client.setPassword(passwordEncoder.encode(password));
            } else {
                client.setPassword(passwordEncoder.encode("defaultPass123"));
            }

            client.setRole("ROLE_CLIENT");
            client.setGenerateLink("/user/view/" + name.replaceAll("\\s", "-").toLowerCase());

            Client savedClient = clientService.saveClient(client);
            log.info("API: Client created successfully with ID: {}", savedClient.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(transformClientToMap(savedClient));
        } catch (Exception e) {
            log.error("API: Error creating client: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Failed to create client: " + e.getMessage()));
        }
    }

    // JSON-based update client (backward compatibility)
    @PutMapping(value = "/clients/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateClientJson(@PathVariable int id, @RequestBody Map<String, Object> clientData) {
        log.info("API: Updating client with ID: {} (JSON)", id);
        try {
            Client existingClient = clientService.getClientById(id);

            if (clientData.containsKey("name")) {
                existingClient.setName((String) clientData.get("name"));
            }
            if (clientData.containsKey("email")) {
                existingClient.setEmail((String) clientData.get("email"));
            }
            if (clientData.containsKey("mobile")) {
                existingClient.setMobile((String) clientData.get("mobile"));
            }
            if (clientData.containsKey("reviewLink")) {
                existingClient.setReviewLink((String) clientData.get("reviewLink"));
            }
            if (clientData.containsKey("chatText")) {
                existingClient.setChatText((String) clientData.get("chatText"));
            }
            if (clientData.containsKey("password")) {
                String password = (String) clientData.get("password");
                if (password != null && !password.isEmpty()) {
                    existingClient.setPassword(passwordEncoder.encode(password));
                }
            }

            existingClient.setGenerateLink("/user/view/" + existingClient.getName().replaceAll("\\s", "-").toLowerCase());

            Client updatedClient = clientService.saveClient(existingClient);
            log.info("API: Client updated successfully: {}", id);

            return ResponseEntity.ok(transformClientToMap(updatedClient));
        } catch (Exception e) {
            log.error("API: Error updating client {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Failed to update client: " + e.getMessage()));
        }
    }

    // Multipart form-data update client (with file upload)
    @PutMapping(value = "/clients/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateClientMultipart(
            @PathVariable int id,
            @RequestParam("name") String name,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "password", required = false) String password,
            @RequestParam("mobile") String mobile,
            @RequestParam("reviewLink") String reviewLink,
            @RequestParam("chatText") String chatText,
            @RequestParam(value = "logo", required = false) MultipartFile logo,
            @RequestParam(value = "existingLogo", required = false) String existingLogo) {

        log.info("API: Updating client with ID: {} (Multipart)", id);
        try {
            Client existingClient = clientService.getClientById(id);

            existingClient.setName(name);
            if (email != null && !email.isEmpty()) {
                existingClient.setEmail(email);
            }
            existingClient.setMobile(mobile);
            existingClient.setReviewLink(reviewLink);
            existingClient.setChatText(chatText);

            // Handle logo upload
            if (logo != null && !logo.isEmpty()) {
                String fileName = saveUploadedFile(logo);
                existingClient.setLogo(fileName);
            } else if (existingLogo != null && !existingLogo.isEmpty()) {
                // Keep existing logo if provided
                existingClient.setLogo(existingLogo);
            }

            // Update password only if provided
            if (password != null && !password.isEmpty()) {
                existingClient.setPassword(passwordEncoder.encode(password));
            }

            existingClient.setGenerateLink("/user/view/" + name.replaceAll("\\s", "-").toLowerCase());

            Client updatedClient = clientService.saveClient(existingClient);
            log.info("API: Client updated successfully: {}", id);

            return ResponseEntity.ok(transformClientToMap(updatedClient));
        } catch (Exception e) {
            log.error("API: Error updating client {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Failed to update client: " + e.getMessage()));
        }
    }

    @DeleteMapping("/clients/{id}")
    public ResponseEntity<?> deleteClient(@PathVariable int id) {
        log.info("API: Deleting client with ID: {}", id);
        try {
            clientService.deleteClient(id);
            log.info("API: Client deleted successfully: {}", id);
            return ResponseEntity.ok(Map.of("message", "Client deleted successfully"));
        } catch (Exception e) {
            log.error("API: Error deleting client {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Failed to delete client: " + e.getMessage()));
        }
    }

    // ==================== VALIDATION ENDPOINTS ====================

    @GetMapping("/clients/check-email")
    public ResponseEntity<?> checkEmailExists(
            @RequestParam String email,
            @RequestParam(required = false) Integer excludeId) {
        log.info("API: Checking if email exists: {}", email);
        try {
            boolean exists = clientService.existsByEmail(email);

            // If excludeId is provided, check if the email belongs to that client
            if (exists && excludeId != null) {
                try {
                    Client client = clientService.getClientById(excludeId);
                    if (client.getEmail().equalsIgnoreCase(email)) {
                        exists = false; // Email belongs to the same client being edited
                    }
                } catch (Exception ignored) {
                    // Client not found, email belongs to another client
                }
            }

            return ResponseEntity.ok(Map.of("exists", exists));
        } catch (Exception e) {
            log.error("API: Error checking email: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to check email"));
        }
    }

    @GetMapping("/clients/check-mobile")
    public ResponseEntity<?> checkMobileExists(
            @RequestParam String mobile,
            @RequestParam(required = false) Integer excludeId) {
        log.info("API: Checking if mobile exists: {}", mobile);
        try {
            boolean exists = clientService.existsByMobile(mobile);

            // If excludeId is provided, check if the mobile belongs to that client
            if (exists && excludeId != null) {
                try {
                    Client client = clientService.getClientById(excludeId);
                    if (client.getMobile().equals(mobile)) {
                        exists = false; // Mobile belongs to the same client being edited
                    }
                } catch (Exception ignored) {
                    // Client not found, mobile belongs to another client
                }
            }

            return ResponseEntity.ok(Map.of("exists", exists));
        } catch (Exception e) {
            log.error("API: Error checking mobile: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to check mobile"));
        }
    }

    // ==================== LOGS ENDPOINTS ====================

    @GetMapping("/logs")
    public ResponseEntity<?> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String reviewLength,
            @RequestParam(required = false) String regenerated) {

        log.info("API: Fetching logs - page: {}, size: {}, search: {}, company: {}", page, size, search, company);
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());

            Page<ReviewGenerationLog> logsPage = logService.searchLogs(
                    search, company, reviewLength, regenerated, null, null, null, pageable);

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
            log.error("API: Error fetching logs: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch logs: " + e.getMessage()));
        }
    }

    @GetMapping("/logs/companies")
    public ResponseEntity<?> getDistinctCompanies() {
        log.info("API: Fetching distinct company names");
        try {
            List<String> companies = logService.getDistinctCompanyNames();
            return ResponseEntity.ok(companies);
        } catch (Exception e) {
            log.error("API: Error fetching companies: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch companies"));
        }
    }

    // ==================== REVIEW GENERATION ENDPOINT ====================

    @Autowired
    private com.yrhp.crud.service.ReviewGeneratorService reviewGeneratorService;

    @PostMapping("/clients/{id}/generate-review")
    public ResponseEntity<?> generateReview(
            @PathVariable int id,
            @RequestBody Map<String, Object> request) {
        log.info("API: Generating review for client ID: {}", id);
        try {
            Client client = clientService.getClientById(id);

            String mode = (String) request.getOrDefault("mode", "tag");
            @SuppressWarnings("unchecked")
            List<String> selectedTags = (List<String>) request.getOrDefault("tags", new ArrayList<>());
            String reviewLength = (String) request.getOrDefault("length", "medium");

            String generatedReview;

            // If auto mode, use the auto generation method
            if ("auto".equals(mode)) {
                // Auto mode: generate review without specific tags
                generatedReview = reviewGeneratorService.generateReview(id, false);
            } else {
                // Tag mode: use selected tags
                if (selectedTags.isEmpty() && client.getChatText() != null) {
                    // Use first 3 tags if none selected
                    String[] allTags = client.getChatText().split(",");
                    selectedTags = new ArrayList<>();
                    for (int i = 0; i < Math.min(3, allTags.length); i++) {
                        selectedTags.add(allTags[i].trim());
                    }
                }
                generatedReview = reviewGeneratorService.generateReviewWithTags(id, selectedTags, reviewLength, false);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("review", generatedReview);
            response.put("mode", mode);
            response.put("length", reviewLength);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("API: Error generating review for client {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Failed to generate review: " + e.getMessage()));
        }
    }

    // ==================== USER PROFILE ENDPOINT ====================

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("API: Fetching user profile");
        try {
            // For now, return a mock profile since we're using simple token auth
            Map<String, Object> profile = new HashMap<>();
            profile.put("message", "Profile endpoint - implement JWT to get actual user");
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            log.error("API: Error fetching profile: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch profile"));
        }
    }

    // ==================== HELPER METHODS ====================

    private String saveUploadedFile(MultipartFile file) throws IOException {
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get("uploads");

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Files.copy(file.getInputStream(), uploadPath.resolve(fileName));
        log.info("File uploaded successfully: {}", fileName);

        return fileName;
    }

    private Map<String, Object> transformClientToMap(Client client) {
        Map<String, Object> clientMap = new HashMap<>();
        clientMap.put("id", client.getId());
        clientMap.put("name", client.getName());
        clientMap.put("email", client.getEmail());
        clientMap.put("mobile", client.getMobile());
        clientMap.put("reviewLink", client.getReviewLink());
        clientMap.put("chatText", client.getChatText());
        clientMap.put("logo", client.getLogo());
        clientMap.put("generateLink", client.getGenerateLink());
        clientMap.put("role", client.getRole());
        // Don't include password
        return clientMap;
    }

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
