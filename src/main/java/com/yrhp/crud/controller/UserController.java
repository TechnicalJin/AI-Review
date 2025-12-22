//package com.yrhp.crud.controller;
//
//import com.yrhp.crud.dao.ClientDao;
//import com.yrhp.crud.model.Client;
//import com.yrhp.crud.model.ReviewGenerationLog;
//import com.yrhp.crud.model.UserDtls;
//import com.yrhp.crud.repository.ClientRepository;
//import com.yrhp.crud.repository.ReviewGenerationLogRepository;
//import com.yrhp.crud.repository.UserRepository;
//import com.yrhp.crud.service.ReviewGeneratorService;
//import com.yrhp.crud.dto.RegenerateReviewRequest;
//// import jakarta.servlet.http.HttpServletRequest;
//import jakarta.annotation.Resource;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.validation.Valid;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.boot.web.servlet.error.ErrorController;
//import org.springframework.core.io.ByteArrayResource;
//import org.springframework.dao.DataAccessException;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.data.domain.Pageable;
//import org.springframework.data.domain.Sort;
//// import org.springframework.http.HttpStatus;
//import org.springframework.format.annotation.DateTimeFormat;
//import org.springframework.http.HttpHeaders;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.MediaType;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Controller;
//import org.springframework.ui.Model;
//import org.springframework.validation.BindingResult;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.File;
//import java.io.IOException;
//import java.nio.charset.StandardCharsets;
//import java.security.Principal;
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.time.format.DateTimeFormatter;
//import java.util.*;
//import java.util.stream.Collectors;
//
//import com.yrhp.crud.exception.ResourceNotFoundException;
//
//@Controller
//@RequestMapping("/user")
//public class UserController implements ErrorController {
//
//    private static final Logger log = LoggerFactory.getLogger(UserController.class);
//    @Autowired
//    private UserRepository userRepo;
//
//    @Autowired
//    private ClientRepository clientRepo;
//
//    @Autowired
//    private ReviewGeneratorService reviewGeneratorService;
//
//    @Autowired
//    private ReviewGenerationLogRepository reviewLogRepository;
//
//    @Autowired
//    private PasswordEncoder passwordEncoder;
//
//    @Value("${spring.servlet.multipart.location}")
//    private String uploadDir;
//
//    @Value("${upload.resource.access.url}")
//    private String resourceAccessUrl;
//
//    @ModelAttribute
//    public void userDetails(Model model, Principal principal) {
//        if (principal != null) {
//            String email = principal.getName();
//            UserDtls user = userRepo.findByEmail(email);
//            model.addAttribute("user", user);
//            if (user == null) {
//                log.warn("User not found for email: {}", email);
//                model.addAttribute("error", "User not found!");
//            } else {
//                log.debug("User details loaded for: {}", email);
//            }
//        }
//    }
//
//
//    @GetMapping("/home")
//    @PreAuthorize("hasRole('USER')")
//    public String home(Model model,
//                       @RequestParam(defaultValue = "0") int page,
//                       @RequestParam(defaultValue = "10") int size,
//                       @RequestParam(defaultValue = "name") String sort) {
//        log.info("Accessing home page - Page: {}, Size: {}, Sort: {}", page, size, sort);
//
//        if (size > 50) {
//            log.warn("Requested page size {} exceeds maximum, setting to 50", size);
//            size = 50;
//        }
//        if (size < 1) {
//            log.warn("Invalid page size {}, setting to default 10", size);
//            size = 10;
//        }
//
//        var pageable = PageRequest.of(page, size, Sort.by(sort).ascending());
//        var clients = clientRepo.findAll(pageable);
//
//        log.debug("Loaded {} clients for page {}", clients.getNumberOfElements(), page);
//        model.addAttribute("clients", clients);
//        model.addAttribute("currentPage", page);
//        model.addAttribute("pageSize", size);
//        model.addAttribute("sortField", sort);
//        model.addAttribute("resourceURL", resourceAccessUrl);
//
//        return "user/home";
//    }
//
//
//    @GetMapping("/details")
//    @PreAuthorize("isAuthenticated()")
//    public String userDetails() {
//        return "user/userDetails";
//    }
//
//
//    /**********      CRUD        **********/
//
//
//
//
//    @GetMapping("/create")
//    public String createClient(Model model) {
//        model.addAttribute("clientDao", new ClientDao());
//        return "user/create";
//    }
//
//
//    @PostMapping("/create")
//    public String saveClient(@ModelAttribute("clientDao") @Valid ClientDao clientDao,
//                             BindingResult result, Model model) {
//        log.info("Attempting to create new client: {}", clientDao.getName());
//
//        try {
//            if (result.hasErrors()) {
//                log.warn("Validation errors while creating client: {}", result.getAllErrors());
//                return "user/create";
//            }
//
//            validateNewClient(clientDao);
//            Client client = createClientFromDao(clientDao);
//            handleLogoUpload(clientDao, client);
//
//            clientRepo.save(client);
//            log.info("Successfully created client: {} (ID: {})", client.getName(), client.getId());
//            return "redirect:/user/home";
//
//        } catch (IllegalArgumentException e) {
//            log.error("Validation error creating client: {}", e.getMessage());
//            model.addAttribute("error", e.getMessage());
//            return "user/create";
//        } catch (IOException e) {
//            log.error("File upload error for client {}: {}", clientDao.getName(), e.getMessage(), e);
//            model.addAttribute("error", "Error uploading file: " + e.getMessage());
//            return "user/create";
//        }
//    }
//
//    private void validateNewClient(ClientDao clientDao) {
//        log.debug("Validating new client: {}", clientDao.getName());
//
//        if (!clientRepo.findByName(clientDao.getName()).isEmpty()) {
//            log.warn("Duplicate client name detected: {}", clientDao.getName());
//            throw new IllegalArgumentException("A client with this name already exists");
//        }
//        if (clientRepo.findByEmail(clientDao.getEmail()).isPresent()) {
//            log.warn("Duplicate client email detected: {}", clientDao.getEmail());
//            throw new IllegalArgumentException("A client with this email already exists");
//        }
//        if (clientRepo.findByMobile(clientDao.getMobile()).isPresent()) {
//            log.warn("Duplicate client mobile detected: {}", clientDao.getMobile());
//            throw new IllegalArgumentException("A client with this mobile number already exists");
//        }
//    }
//
//    private Client createClientFromDao(ClientDao clientDao) {
//        Client client = new Client();
//        client.setName(clientDao.getName());
//        client.setEmail(clientDao.getEmail());
//        client.setPassword(passwordEncoder.encode(clientDao.getPassword()));
//        client.setMobile(clientDao.getMobile());
//        client.setReviewLink(clientDao.getReviewLink());
//        client.setChatText(clientDao.getChatText());
//        client.setRole(clientDao.getRole());
//        client.setGenerateLink("/user/view/" + client.getName().replaceAll("\\s", "-").toLowerCase());
//        return client;
//    }
//
//    private void handleLogoUpload(ClientDao clientDao, Client client) throws IOException {
//        MultipartFile logo = clientDao.getLogo();
//        if (logo != null && !logo.isEmpty()) {
//            String contentType = logo.getContentType();
//            if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png"))) {
//                throw new IllegalArgumentException("Only JPG and PNG images are allowed");
//            }
//
//            String logoFileName = System.currentTimeMillis() + "_" + logo.getOriginalFilename();
//            File destinationFile = new File(uploadDir + File.separator + logoFileName);
//            logo.transferTo(destinationFile);
//            client.setLogo(logoFileName);
//        }
//    }
//
//    @PostMapping("/checkDuplicate")
//    @ResponseBody
//    public Map<String, Boolean> checkDuplicate(
//            @RequestParam(required = false) String name,
//            @RequestParam(required = false) String email,
//            @RequestParam(required = false) String mobile,
//            @RequestParam(required = false) String reviewLink
//    ) {
//        Map<String, Boolean> response = new HashMap<>();
//        boolean isDuplicate = false;
//
//        if (name != null) {
//            isDuplicate = clientRepo.existsByNameIgnoreCase(name);
//        } else if (email != null) {
//            isDuplicate = clientRepo.existsByEmail(email);
//        } else if (mobile != null) {
//            isDuplicate = clientRepo.existsByMobile(mobile);
//        } else if (reviewLink != null) {
//            isDuplicate = clientRepo.existsByReviewLink(reviewLink);
//        }
//
//        response.put("isDuplicate", isDuplicate);
//        return response;
//    }
//
//    @GetMapping("/view/{name}")
//    public String viewClient(@PathVariable("name") String name, Model model) {
//        log.info("Viewing client: {}", name);
//        String formattedName = name.replace("-", " ");
//        List<Client> clients = clientRepo.findByName(formattedName);
//
//        if (clients.isEmpty()) {
//            log.error("Client not found: {}", formattedName);
//            throw new ResourceNotFoundException("Client not found with name: " + formattedName);
//        }
//
//        Client client = clients.get(0);
//        log.debug("Displaying client details for ID: {}", client.getId());
//        model.addAttribute("client", client);
//        model.addAttribute("clients", clients);
//
//        String existingReview = (String) model.getAttribute("review");
//        if(existingReview == null || existingReview.isEmpty()){
//            String review = reviewGeneratorService.generateReview(client.getId());
//            model.addAttribute("review", review);
//        }
//
//        return "user/view";
//    }
//
//    /*@GetMapping("/regenerate/{id}")
//    public String regenerateReview(@PathVariable("id") int id, Model model) {
//        String review = reviewGeneratorService.generateReview(id);
//        model.addAttribute("review", review);
//
//        Optional<Client> clientOptional = clientRepo.findById(id);
//        if (clientOptional.isPresent()) {
//            model.addAttribute("client", clientOptional.get()); // Add client to the model
//        }
//        return "user/view"; // Return to the view page
//    }*/
//
//    @GetMapping("/test/{id}")
//    @ResponseBody
//    public String test(@PathVariable("id") int id) {
//        return "Test ID: " + id;
//    }
//
//    @PostMapping("/regenerate/{id}")
//    public @ResponseBody String regenerateReview(
//            @PathVariable("id") int id,
//            @RequestBody RegenerateReviewRequest request) {
//        log.info("Regenerating review for client ID: {} with {} tags", id, request.getSelectedTags().size());
//
//        if (request.getSelectedTags() == null || request.getSelectedTags().size() < 3) {
//            log.warn("Insufficient tags selected for client ID: {} - only {} tags provided",
//                    id, request.getSelectedTags() != null ? request.getSelectedTags().size() : 0);
//            throw new IllegalArgumentException("At least 3 tags must be selected");
//        }
////        return reviewGeneratorService.generateReviewWithTags(id, request.getSelectedTags(), request.getReviewLength());
//        return reviewGeneratorService.generateReviewWithTags(id, request.getSelectedTags(), request.getReviewLength(), true);
//    }
//
//    @PostMapping("/generate")
//    public @ResponseBody String generateReview(
//            @RequestParam int clientId,
//            @RequestParam(required = false) List<String> tags,
//            @RequestParam(defaultValue = "medium") String reviewLength) {
//
//        if (tags != null && !tags.isEmpty()) {
//            // Tag-based generation (initial)
//            return reviewGeneratorService.generateReviewWithTags(clientId, tags, reviewLength);
//        } else {
//            // Normal generation
//            return reviewGeneratorService.generateReview(clientId);
//        }
//    }
//
//    @GetMapping("/log")
//    @PreAuthorize("isAuthenticated()")
//    public String viewLogs(Model model,
//                           @RequestParam(defaultValue = "0") int page,
//                           @RequestParam(defaultValue = "10") int size,
//                           @RequestParam(required = false) String search,
//                           @RequestParam(required = false) String company,
//                           @RequestParam(required = false) String reviewLength,
//                           @RequestParam(required = false) String regenerated,
//                           @RequestParam(required = false) String keyPoints,
//                           @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
//                           @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
//
//        size = Math.min(Math.max(size, 1), 50);
//        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
//
//        company = (company != null && !company.trim().isEmpty()) ? company.trim() : null;
//        search = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
//        reviewLength = (reviewLength != null && !reviewLength.trim().isEmpty()) ? reviewLength.trim() : null;
//        regenerated = (regenerated != null && !regenerated.trim().isEmpty()) ? regenerated.trim() : null;
//        keyPoints = (keyPoints != null && !keyPoints.trim().isEmpty()) ? keyPoints.trim() : null;
//
//        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
//        LocalDateTime endDateTime = endDate != null ? endDate.atTime(23, 59, 59, 999999999) : null;
//
//        Page<ReviewGenerationLog> logPage = reviewLogRepository.searchWithFilters(
//                search, company, reviewLength, regenerated, keyPoints, startDateTime, endDateTime, pageable
//        );
//
//        List<String> distinctCompanies = reviewLogRepository.findDistinctCompanyNames();
//
//        model.addAttribute("logs", logPage);
//        model.addAttribute("distinctCompanies", distinctCompanies);
//
//        Map<String, String> filters = new LinkedHashMap<>();
//        filters.put("company", company != null ? company : "");
//        filters.put("reviewLength", reviewLength != null ? reviewLength : "");
//        filters.put("regenerated", regenerated != null ? regenerated : "");
//        filters.put("keyPoints", keyPoints != null ? keyPoints : "");
//        filters.put("search", search != null ? search : "");
//        filters.put("startDate", startDate != null ? startDate.toString() : "");
//        filters.put("endDate", endDate != null ? endDate.toString() : "");
//
//        model.addAttribute("filters", filters);
//
//        return "user/log_view";
//    }
//
//
//
//    @PostMapping("/submitReview")
//    public ResponseEntity<String> submitReview(@RequestParam("clientId") int clientId,
//                                               @RequestParam String reviewLink) {
//        log.info("Submitting review for client ID: {}", clientId);
//
//        if (reviewLink.length() > 255) {
//            log.warn("Review URL too long for client ID: {} - length: {}", clientId, reviewLink.length());
//            return ResponseEntity.badRequest().body("URL too long");
//        }
//
//        Optional<Client> clientOptional = clientRepo.findById(clientId);
//        if (clientOptional.isPresent()) {
//            Client client = clientOptional.get();
//            client.setReviewLink(reviewLink);
//            clientRepo.save(client);
//            log.info("Review link updated for client ID: {}", clientId);
//            return ResponseEntity.ok("Review submitted successfully");
//        } else {
//            log.error("Client not found for ID: {}", clientId);
//            return ResponseEntity.badRequest().body("Client not found");
//        }
//    }
//
//    @GetMapping("/edit/{id}")
//    public String editClient(@PathVariable("id") int id, Model model) {
//        Optional<Client> optionalClient = clientRepo.findById(id);
//
//        if (optionalClient.isPresent()) {
//            Client client = optionalClient.get();
//            ClientDao clientDao = new ClientDao();
//
//            clientDao.setName(client.getName());
//            clientDao.setEmail(client.getEmail());
//            clientDao.setPassword(client.getPassword());
//            clientDao.setMobile(client.getMobile());
//            clientDao.setReviewLink(client.getReviewLink());
//            clientDao.setChatText(client.getChatText());
//            clientDao.setGenerateLink(client.getGenerateLink());
//            clientDao.setExistingLogo(client.getLogo());
//            clientDao.setRole(client.getRole());
//
//            model.addAttribute("clientDao", clientDao);
//            model.addAttribute("clientId", id);
//            return "user/edit";
//        } else {
//            return "redirect:/user?error=notfound";
//        }
//    }
//
//    @PostMapping("/edit/{id}")
//    public String updateClient(@PathVariable("id") int id,
//                               @ModelAttribute("clientDao") @Valid ClientDao clientDao,
//                               BindingResult result, Model model) {
//        log.info("Updating client ID: {}", id);
//
//        if (result.hasErrors()) {
//            log.warn("Validation errors updating client ID {}: {}", id, result.getAllErrors());
//            model.addAttribute("clientId", id);
//            return "user/edit";
//        }
//
//        Optional<Client> optionalClient = clientRepo.findById(id);
//        if (optionalClient.isPresent()) {
//            Client client = optionalClient.get();
//            log.debug("Found existing client: {} (ID: {})", client.getName(), id);
//
//            // Validate unique name, email, and mobile
//            List<Client> existingClients = clientRepo.findByName(clientDao.getName());
//            if (!existingClients.isEmpty() && existingClients.get(0).getId() != client.getId()) {
//                model.addAttribute("error", "A client with this name already exists. Please add a different name.");
//                return "user/edit";
//            }
//
//            Optional<Client> existingEmailClient = clientRepo.findByEmail(clientDao.getEmail());
//            if (existingEmailClient.isPresent() && existingEmailClient.get().getId() != id) {
//                model.addAttribute("error", "A client with this email already exists.");
//                return "user/edit";
//            }
//
//            Optional<Client> existingMobileClient = clientRepo.findByMobile(clientDao.getMobile());
//            if (existingMobileClient.isPresent() && existingMobileClient.get().getId() != id) {
//                model.addAttribute("error", "A client with this mobile number already exists.");
//                return "user/edit";
//            }
//
//            // Update fields
//            client.setName(clientDao.getName());
//            client.setEmail(clientDao.getEmail());
//            client.setMobile(clientDao.getMobile());
//            client.setReviewLink(clientDao.getReviewLink());
//            client.setChatText(clientDao.getChatText());
//            client.setRole(clientDao.getRole());
//
//            // Only update password if a new one is provided
//            if (clientDao.getPassword() != null && !clientDao.getPassword().trim().isEmpty()) {
//                client.setPassword(passwordEncoder.encode(clientDao.getPassword()));
//            }
//
//            // Preserve or update the logo
//            MultipartFile logo = clientDao.getLogo();
//            if (logo != null && !logo.isEmpty()) {
//                String contentType = logo.getContentType();
//                if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png"))) {
//                    log.info("Only JPG and PNG images are allowed.");
//                    model.addAttribute("error", "Only JPG and PNG images are allowed.");
//                    return "user/edit";
//                }
//                String logoFileName = UUID.randomUUID().toString() + "_" + logo.getOriginalFilename();
//                File destinationFile = new File(uploadDir + File.separator + logoFileName);
//                try {
//                    logo.transferTo(destinationFile);
//                    log.info("Uploaded new logo for client ID: {}", id);
//                    client.setLogo(logoFileName);
//                } catch (IOException e) {
//                    log.error("Error uploading logo for client ID {}: {}", id, e.getMessage(), e);
//                }
//            } else {
//                client.setLogo(clientDao.getExistingLogo()); // Keep the existing logo
//                log.warn("Keeping Existing Logo for ID: {}", id);
//            }
//
//            // Generate a unique client link
//            String uniqueLink = "/user/view/" + client.getName().replaceAll("\\s", "-").toLowerCase();
//            client.setGenerateLink(uniqueLink);
//
//            clientRepo.save(client);
//        }
//
//        return "redirect:/user/home";
//    }
//
//
//
//    @GetMapping("/delete/{id}")
//    public String deleteClient(@PathVariable("id") int id) {
//        clientRepo.deleteById(id);
//        return "redirect:/user/home";
//    }
//
//
//    @PostMapping("/delete/{id}")
//    public String removeClient(@PathVariable("id") int id) {
//        log.info("Attempting to delete client ID: {}", id);
//
//        try {
//            clientRepo.deleteById(id);
//            log.info("Successfully deleted client ID: {}", id);
//        } catch (Exception e) {
//            log.error("Error deleting client ID {}: {}", id, e.getMessage(), e);
//            return "redirect:/user/home?error=deletefailed";
//        }
//        return "redirect:/user/home";
//    }
//
//
//    @GetMapping("/search")
//    public String searchClients(@RequestParam("query") String query,
//                                @RequestParam(defaultValue = "0") int page,
//                                @RequestParam(defaultValue = "10") int size,
//                                Model model) {
//
//        log.info("Searching clients for query: '{}' (Page: {}, Size: {})", query, page, size);
//
//        if (size > 50) size = 50;
//        if (size < 1) size = 10;
//
//        var pageable = PageRequest.of(page, size);
//        var searchResults = clientRepo.findByNameContainingIgnoreCaseOrMobileContainingOrEmailContainingIgnoreCase(
//                query, query, query, pageable);
//
//        log.debug("Found {} results for query '{}'", searchResults.getNumberOfElements(), query);
//
//        model.addAttribute("clients", searchResults);
//        model.addAttribute("currentPage", page);
//        model.addAttribute("pageSize", size);
//        model.addAttribute("searchQuery", query);
//        model.addAttribute("resourceURL", resourceAccessUrl);
//
//        return "user/home";
//    }
//
//    @PostMapping("/download-csv")
//    public ResponseEntity<org.springframework.core.io.Resource> downloadClientLogs(@RequestParam Long clientId, HttpServletRequest request) {
//        try {
//            // Find client by ID using proper Optional pattern
//            Optional<Client> clientOptional = clientRepo.findById(clientId);
//            if (!clientOptional.isPresent()) {
//                log.warn("Client not found with ID: {}", clientId);
//                return ResponseEntity.notFound().build();
//            }
//
//            Client client = clientOptional.get();
//            log.info("Downloading CSV for client: {} (ID: {})", client.getName(), clientId);
//
//            // Get logs for this client and sort by timestamp descending (latest first)
//            List<ReviewGenerationLog> logs = reviewLogRepository.findByCompanyName(client.getName())
//                    .stream()
//                    .sorted(Comparator.comparing(ReviewGenerationLog::getTimestamp, Comparator.reverseOrder()))
//                    .collect(Collectors.toList());
//            log.info("Found {} logs for client: {}", logs.size(), client.getName());
//
//            // Build CSV content with proper headers
//            StringBuilder csvContent = new StringBuilder();
//            csvContent.append("ID,Company,Timestamp,Review Length,Key Points,Regenerated\n");
//
//            // Date formatter for Indian format DD/MM/YYYY
//            DateTimeFormatter indianDateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
//
//            for (ReviewGenerationLog logEntry : logs) {
//                csvContent.append(escapeCSVValue(logEntry.getId() != null ? logEntry.getId().toString() : "")).append(",")
//                        .append(escapeCSVValue(logEntry.getCompanyName() != null ? logEntry.getCompanyName() : "")).append(",")
//                        .append(escapeCSVValue(logEntry.getTimestamp() != null ?
//                                logEntry.getTimestamp().format(indianDateFormatter) : "")).append(",")
//                        .append(escapeCSVValue(logEntry.getReviewLength() != null ? logEntry.getReviewLength().toString() : "")).append(",")
//                        .append(escapeCSVValue(logEntry.getKeyPoints() != null ? logEntry.getKeyPoints() : "")).append(",")
//                        .append(escapeCSVValue(logEntry.getRegenerated() != null ? logEntry.getRegenerated().toString() : "false")).append("\n");
//            }
//
//            // Handle empty logs case
//            if (logs.isEmpty()) {
//                csvContent.append("No logs found for ").append(escapeCSVValue(client.getName())).append("\n");
//            }
//
//            // Convert to bytes with UTF-8 BOM for Excel compatibility
//            byte[] bom = {(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};
//            byte[] csvBytes = csvContent.toString().getBytes(StandardCharsets.UTF_8);
//            byte[] csvWithBom = new byte[bom.length + csvBytes.length];
//            System.arraycopy(bom, 0, csvWithBom, 0, bom.length);
//            System.arraycopy(csvBytes, 0, csvWithBom, bom.length, csvBytes.length);
//
//            ByteArrayResource resource = new ByteArrayResource(csvWithBom);
//
//            // Create safe filename
//            String filename = sanitizeFilename(client.getName()) + "_logs_" +
//                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";
//
//            log.info("Generated CSV file: {} with {} bytes", filename, csvWithBom.length);
//
//            return ResponseEntity.ok()
//                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
//                    .header(HttpHeaders.CONTENT_TYPE, "text/csv; charset=utf-8")
//                    .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
//                    .header(HttpHeaders.PRAGMA, "no-cache")
//                    .header(HttpHeaders.EXPIRES, "0")
//                    .contentLength(csvWithBom.length)
//                    .body(resource);
//
//        } catch (DataAccessException e) {
//            log.error("Database error while downloading CSV for client ID: {}", clientId, e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        } catch (Exception e) {
//            log.error("Error downloading CSV for client ID: {}", clientId, e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    // Helper method to properly escape CSV values
//    private String escapeCSVValue(String value) {
//        if (value == null || value.trim().isEmpty()) {
//            return "";
//        }
//
//        // Trim whitespace
//        value = value.trim();
//
//        // If value contains comma, newline, or double quote, wrap in quotes and escape quotes
//        if (value.contains(",") || value.contains("\n") || value.contains("\r") || value.contains("\"")) {
//            return "\"" + value.replace("\"", "\"\"") + "\"";
//        }
//
//        return value;
//    }
//
//    // Helper method to create safe filename
//    private String sanitizeFilename(String filename) {
//        if (filename == null || filename.trim().isEmpty()) {
//            return "client";
//        }
//
//        // Replace unsafe characters with underscore
//        String sanitized = filename.trim()
//                .replaceAll("[^a-zA-Z0-9\\-_\\s]", "_")
//                .replaceAll("\\s+", "_")
//                .replaceAll("_{2,}", "_")
//                .replaceAll("^_|_$", "");
//
//        // Ensure it's not empty after sanitization
//        return sanitized.isEmpty() ? "client" : sanitized;
//    }
//
//    // Alternative method using GET mapping for direct links (if needed)
//    @GetMapping("/download-csv/{id}")
//    public ResponseEntity<org.springframework.core.io.Resource> downloadClientLogsGet(@PathVariable("id") Long clientId, HttpServletRequest request) {
//        return downloadClientLogs(clientId, request);
//    }
//}



package com.yrhp.crud.controller;

import com.yrhp.crud.dao.ClientDao;
import com.yrhp.crud.model.Client;
import com.yrhp.crud.model.ReviewGenerationLog;
import com.yrhp.crud.model.UserDtls;
import com.yrhp.crud.repository.ClientRepository;
import com.yrhp.crud.repository.ReviewGenerationLogRepository;
import com.yrhp.crud.repository.UserRepository;
import com.yrhp.crud.service.ReviewGeneratorService;
import com.yrhp.crud.service.WhisperClientService;
import com.yrhp.crud.dto.RegenerateReviewRequest;
import com.yrhp.crud.dto.VoiceReviewResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.env.Environment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.yrhp.crud.exception.ResourceNotFoundException;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/user")
public class UserController implements ErrorController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ClientRepository clientRepo;

    @Autowired
    private ReviewGeneratorService reviewGeneratorService;

    @Autowired
    private ReviewGenerationLogRepository reviewLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private Environment environment;

    @Autowired
    private WhisperClientService whisperClientService;

    @Value("${spring.servlet.multipart.location}")
    private String uploadDir;

    @Value("${upload.resource.access.url}")
    private String resourceAccessUrl;

    @ModelAttribute
    public void userDetails(Model model, Principal principal) {
        if (principal != null) {
            String email = principal.getName();
            UserDtls user = userRepo.findByEmail(email);
            model.addAttribute("user", user);
            if (user == null) {
                log.warn("User not found for email: {}", email);
                model.addAttribute("error", "User not found!");
            } else {
                log.debug("User details loaded for: {}", email);
            }
        }
    }

    @GetMapping("/home")
    @PreAuthorize("hasRole('USER')")
    public String home(Model model,
                       @RequestParam(defaultValue = "0") int page,
                       @RequestParam(defaultValue = "10") int size,
                       @RequestParam(defaultValue = "name") String sort) {
        log.info("Accessing home page - Page: {}, Size: {}, Sort: {}", page, size, sort);

        if (size > 50) {
            log.warn("Requested page size {} exceeds maximum, setting to 50", size);
            size = 50;
        }
        if (size < 1) {
            log.warn("Invalid page size {}, setting to default 10", size);
            size = 10;
        }

        var pageable = PageRequest.of(page, size, Sort.by(sort).ascending());
        var clients = clientRepo.findAll(pageable);

        log.debug("Loaded {} clients for page {}", clients.getNumberOfElements(), page);
        model.addAttribute("clients", clients);
        model.addAttribute("currentPage", page);
        model.addAttribute("pageSize", size);
        model.addAttribute("sortField", sort);
        model.addAttribute("resourceURL", resourceAccessUrl);

        return "user/home";
    }

    @GetMapping("/details")
    @PreAuthorize("isAuthenticated()")
    public String userDetails() {
        return "user/userDetails";
    }

    @GetMapping("/create")
    public String createClient(Model model) {
        model.addAttribute("clientDao", new ClientDao());
        return "user/create";
    }

    @PostMapping("/create")
    public String saveClient(@ModelAttribute("clientDao") @Valid ClientDao clientDao,
                             BindingResult result, Model model) {
        log.info("Attempting to create new client: {}", clientDao.getName());
        try {
            if (result.hasErrors()) {
                log.warn("Validation errors while creating client: {}", result.getAllErrors());
                return "user/create";
            }
            validateNewClient(clientDao);
            Client client = createClientFromDao(clientDao);
            handleLogoUpload(clientDao, client);
            clientRepo.save(client);
            log.info("Successfully created client: {} (ID: {})", client.getName(), client.getId());
            return "redirect:/user/home";
        } catch (IllegalArgumentException e) {
            log.error("Validation error creating client: {}", e.getMessage());
            model.addAttribute("error", e.getMessage());
            return "user/create";
        } catch (IOException e) {
            log.error("File upload error for client {}: {}", clientDao.getName(), e.getMessage(), e);
            model.addAttribute("error", "Error uploading file: " + e.getMessage());
            return "user/create";
        } catch (Exception e) {
            log.error("Unexpected error creating client: {}", e.getMessage(), e);
            model.addAttribute("error", "Unexpected error: " + e.getMessage());
            return "user/create";
        }
    }

    private void validateNewClient(ClientDao clientDao) {
        log.debug("Validating new client: {}", clientDao.getName());

        if (!clientRepo.findByName(clientDao.getName()).isEmpty()) {
            log.warn("Duplicate client name detected: {}", clientDao.getName());
            throw new IllegalArgumentException("A client with this name already exists");
        }
        if (clientRepo.findByEmail(clientDao.getEmail()).isPresent()) {
            log.warn("Duplicate client email detected: {}", clientDao.getEmail());
            throw new IllegalArgumentException("A client with this email already exists");
        }
        if (clientRepo.findByMobile(clientDao.getMobile()).isPresent()) {
            log.warn("Duplicate client mobile detected: {}", clientDao.getMobile());
            throw new IllegalArgumentException("A client with this mobile number already exists");
        }
    }

    private Client createClientFromDao(ClientDao clientDao) {
        Client client = new Client();
        client.setName(clientDao.getName());
        client.setEmail(clientDao.getEmail());
        client.setPassword(passwordEncoder.encode(clientDao.getPassword()));
        client.setMobile(clientDao.getMobile());
        client.setReviewLink(clientDao.getReviewLink());
        client.setChatText(clientDao.getChatText());
        client.setRole(clientDao.getRole());
        client.setGenerateLink("/user/view/" + client.getName().replaceAll("\\s", "-").toLowerCase());
        return client;
    }

    private void handleLogoUpload(ClientDao clientDao, Client client) throws IOException {
        MultipartFile logo = clientDao.getLogo();
        if (logo != null && !logo.isEmpty()) {
            String contentType = logo.getContentType();
            if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png"))) {
                throw new IllegalArgumentException("Only JPG and PNG images are allowed");
            }
            if (logo.getSize() > 5 * 1024 * 1024) { // 5MB limit
                throw new IllegalArgumentException("File size must be less than 5MB");
            }

            String logoFileName = UUID.randomUUID().toString() + "_" + logo.getOriginalFilename();
            File destinationFile = new File(uploadDir + File.separator + logoFileName);
            logo.transferTo(destinationFile);
            client.setLogo(logoFileName);
        }
    }

    @PostMapping("/checkDuplicate")
    @ResponseBody
    public Map<String, Boolean> checkDuplicate(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String mobile,
            @RequestParam(required = false) String reviewLink) {
        try {
            Map<String, Boolean> response = new HashMap<>();
            boolean isDuplicate = false;

            if (name != null) {
                isDuplicate = clientRepo.existsByNameIgnoreCase(name);
            } else if (email != null) {
                isDuplicate = clientRepo.existsByEmail(email);
            } else if (mobile != null) {
                isDuplicate = clientRepo.existsByMobile(mobile);
            } else if (reviewLink != null) {
                isDuplicate = clientRepo.existsByReviewLink(reviewLink);
            }

            response.put("isDuplicate", isDuplicate);
            return response;
        } catch (Exception e) {
            log.error("Error checking duplicate: {}", e.getMessage(), e);
            Map<String, Boolean> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            return errorResponse;
        }
    }

    @GetMapping("/view/{name}")
    public String viewClient(@PathVariable("name") String name, Model model) {
        try {
            log.info("Viewing client: {}", name);
            String formattedName = name.replace("-", " ");
            List<Client> clients = clientRepo.findByName(formattedName);

            if (clients.isEmpty()) {
                log.error("Client not found: {}", formattedName);
                throw new ResourceNotFoundException("Client not found with name: " + formattedName);
            }

            Client client = clients.get(0);
            log.debug("Displaying client details for ID: {}", client.getId());
            model.addAttribute("client", client);
            model.addAttribute("clients", clients);

            String existingReview = (String) model.getAttribute("review");
            if (existingReview == null || existingReview.isEmpty()) {
                String review = reviewGeneratorService.generateReview(client.getId());
                model.addAttribute("review", review);
            }

            // Get the tags used in the last review generation
            List<String> usedTags = reviewGeneratorService.getLastUsedTags(client.getId());
            model.addAttribute("usedTags", usedTags);

            return "user/view";
        } catch (ResourceNotFoundException e) {
            // Re-throw to be handled by GlobalExceptionHandler
            throw e;
        } catch (Exception e) {
            log.error("Error viewing client: {}", e.getMessage(), e);
            return "redirect:/user/home?error=viewFailed";
        }
    }

    @PostMapping("/regenerate/{id}")
    @ResponseBody
    public String regenerateReview(
            @PathVariable("id") int id,
            @RequestBody RegenerateReviewRequest request) {
        try {
            // Mode-aware validation: Support both Auto and Tag modes
            // Auto mode sends first 5 tags automatically, Tag mode requires user selection
            if (request.getSelectedTags() == null || request.getSelectedTags().isEmpty()) {
                log.warn("No tags provided for client ID: {}", id);
                throw new IllegalArgumentException("Tags are required for review generation");
            }

            // Log the number of tags being used
            log.info("Regenerating review for client ID: {} with {} tags", 
                    id, request.getSelectedTags().size());

            // Minimum validation: At least 1 tag is required (relaxed from 3 for auto mode)
            // Frontend in Tag mode enforces 3+ tags, Auto mode sends 5 tags
            if (request.getSelectedTags().size() < 1) {
                log.warn("Insufficient tags selected for client ID: {} - only {} tags provided",
                        id, request.getSelectedTags().size());
                throw new IllegalArgumentException("At least 1 tag must be provided");
            }

            return reviewGeneratorService.generateReviewWithTags(id, request.getSelectedTags(), request.getReviewLength(), true);
        } catch (IllegalArgumentException e) {
            // Re-throw to be handled by GlobalExceptionHandler
            throw e;
        } catch (Exception e) {
            log.error("Error regenerating review for client ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to regenerate review", e);
        }
    }

    @PostMapping("/generate")
    @ResponseBody
    public String generateReview(
            @RequestParam int clientId,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(defaultValue = "medium") String reviewLength) {
        try {
            if (tags != null && !tags.isEmpty()) {
                return reviewGeneratorService.generateReviewWithTags(clientId, tags, reviewLength);
            } else {
                return reviewGeneratorService.generateReview(clientId);
            }
        } catch (Exception e) {
            log.error("Error generating review for client ID {}: {}", clientId, e.getMessage(), e);
            throw new RuntimeException("Failed to generate review", e);
        }
    }

    @GetMapping("/log")
    @PreAuthorize("isAuthenticated()")
    public String viewLogs(Model model,
                           @RequestParam(defaultValue = "0") int page,
                           @RequestParam(defaultValue = "10") int size,
                           @RequestParam(required = false) String search,
                           @RequestParam(required = false) String company,
                           @RequestParam(required = false) String reviewLength,
                           @RequestParam(required = false) String regenerated,
                           @RequestParam(required = false) String keyPoints,
                           @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
                           @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {

        size = Math.min(Math.max(size, 1), 50);
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());

        company = (company != null && !company.trim().isEmpty()) ? company.trim() : null;
        search = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        reviewLength = (reviewLength != null && !reviewLength.trim().isEmpty()) ? reviewLength.trim() : null;
        regenerated = (regenerated != null && !regenerated.trim().isEmpty()) ? regenerated.trim() : null;
        keyPoints = (keyPoints != null && !keyPoints.trim().isEmpty()) ? keyPoints.trim() : null;

        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.atTime(23, 59, 59, 999999999) : null;

        Page<ReviewGenerationLog> logPage = reviewLogRepository.searchWithFilters(
                search, company, reviewLength, regenerated, keyPoints, startDateTime, endDateTime, pageable
        );

        List<String> distinctCompanies = reviewLogRepository.findDistinctCompanyNames();

        model.addAttribute("logs", logPage);
        model.addAttribute("distinctCompanies", distinctCompanies);

        Map<String, String> filters = new LinkedHashMap<>();
        filters.put("company", company != null ? company : "");
        filters.put("reviewLength", reviewLength != null ? reviewLength : "");
        filters.put("regenerated", regenerated != null ? regenerated : "");
        filters.put("keyPoints", keyPoints != null ? keyPoints : "");
        filters.put("search", search != null ? search : "");
        filters.put("startDate", startDate != null ? startDate.toString() : "");
        filters.put("endDate", endDate != null ? endDate.toString() : "");

        model.addAttribute("filters", filters);

        return "user/log_view";
    }

    @PostMapping("/submitReview")
    public ResponseEntity<String> submitReview(@RequestParam("clientId") int clientId,
                                               @RequestParam String reviewLink) {
        try {
            log.info("Submitting review for client ID: {}", clientId);

            if (reviewLink.length() > 255) {
                log.warn("Review URL too long for client ID: {} - length: {}", clientId, reviewLink.length());
                return ResponseEntity.badRequest().body("URL too long");
            }

            Optional<Client> clientOptional = clientRepo.findById(clientId);
            if (clientOptional.isPresent()) {
                Client client = clientOptional.get();
                client.setReviewLink(reviewLink);
                clientRepo.save(client);
                log.info("Review link updated for client ID: {}", clientId);
                return ResponseEntity.ok("Review submitted successfully");
            } else {
                log.error("Client not found for ID: {}", clientId);
                return ResponseEntity.badRequest().body("Client not found");
            }
        } catch (Exception e) {
            log.error("Error submitting review for client ID {}: {}", clientId, e.getMessage(), e);
            return ResponseEntity.status(500).body("Error submitting review");
        }
    }

    @GetMapping("/edit/{id}")
    public String editClient(@PathVariable("id") int id, Model model) {
        try {
            Optional<Client> optionalClient = clientRepo.findById(id);

            if (optionalClient.isPresent()) {
                Client client = optionalClient.get();
                ClientDao clientDao = new ClientDao();

                clientDao.setId(client.getId());
                clientDao.setName(client.getName());
                clientDao.setEmail(client.getEmail());
                clientDao.setMobile(client.getMobile());
                clientDao.setReviewLink(client.getReviewLink());
                clientDao.setChatText(client.getChatText());
                clientDao.setGenerateLink(client.getGenerateLink());
                clientDao.setExistingLogo(client.getLogo());
                clientDao.setRole(client.getRole());

                model.addAttribute("clientDao", clientDao);
                model.addAttribute("clientId", id);
                return "user/edit";
            } else {
                log.error("Client not found for ID: {}", id);
                return "redirect:/user/home?error=notfound";
            }
        } catch (Exception e) {
            log.error("Error editing client ID {}: {}", id, e.getMessage(), e);
            return "redirect:/user/home?error=editFailed";
        }
    }

    @PostMapping("/edit/{id}")
    public String updateClient(@PathVariable("id") int id,
                               @ModelAttribute("clientDao") ClientDao clientDao,
                               BindingResult result, Model model) {
        log.info("Updating client ID: {}", id);
        try {
            // Custom validation for password (only if provided)
            if (clientDao.getPassword() != null && !clientDao.getPassword().trim().isEmpty()) {
                if (clientDao.getPassword().length() < 6) {
                    result.rejectValue("password", "Size.password", "Password must be at least 6 characters");
                }
            }
            if (result.hasErrors()) {
                log.warn("Validation errors updating client ID {}: {}", id, result.getAllErrors());
                model.addAttribute("clientId", id);
                return "user/edit";
            }
            Optional<Client> optionalClient = clientRepo.findById(id);
            if (optionalClient.isPresent()) {
                Client client = optionalClient.get();
                log.debug("Found existing client: {} (ID: {})", client.getName(), id);
                // Validate unique name, email, and mobile
                List<Client> existingClients = clientRepo.findByName(clientDao.getName());
                if (!existingClients.isEmpty() && existingClients.get(0).getId() != client.getId()) {
                    model.addAttribute("error", "A client with this name already exists. Please add a different name.");
                    model.addAttribute("clientId", id);
                    return "user/edit";
                }
                Optional<Client> existingEmailClient = clientRepo.findByEmail(clientDao.getEmail());
                if (existingEmailClient.isPresent() && existingEmailClient.get().getId() != id) {
                    model.addAttribute("error", "A client with this email already exists.");
                    model.addAttribute("clientId", id);
                    return "user/edit";
                }
                Optional<Client> existingMobileClient = clientRepo.findByMobile(clientDao.getMobile());
                if (existingMobileClient.isPresent() && existingMobileClient.get().getId() != id) {
                    model.addAttribute("error", "A client with this mobile number already exists.");
                    model.addAttribute("clientId", id);
                    return "user/edit";
                }
                // Update fields
                client.setName(clientDao.getName());
                client.setEmail(clientDao.getEmail());
                client.setMobile(clientDao.getMobile());
                client.setReviewLink(clientDao.getReviewLink());
                client.setChatText(clientDao.getChatText());
                client.setRole(clientDao.getRole());
                // Only update password if a new one is provided
                if (clientDao.getPassword() != null && !clientDao.getPassword().trim().isEmpty()) {
                    client.setPassword(passwordEncoder.encode(clientDao.getPassword()));
                }
                // Preserve or update the logo
                MultipartFile logo = clientDao.getLogo();
                if (logo != null && !logo.isEmpty()) {
                    String contentType = logo.getContentType();
                    if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png"))) {
                        log.error("Invalid file type for logo upload for client ID: {}", id);
                        model.addAttribute("error", "Only JPG and PNG images are allowed.");
                        model.addAttribute("clientId", id);
                        return "user/edit";
                    }
                    if (logo.getSize() > 5 * 1024 * 1024) { // 5MB limit
                        log.error("Logo file size exceeds 5MB for client ID: {}", id);
                        model.addAttribute("error", "File size must be less than 5MB.");
                        model.addAttribute("clientId", id);
                        return "user/edit";
                    }
                    String logoFileName = UUID.randomUUID().toString() + "_" + logo.getOriginalFilename();
                    File destinationFile = new File(uploadDir + File.separator + logoFileName);
                    try {
                        logo.transferTo(destinationFile);
                        log.info("Uploaded new logo for client ID: {}", id);
                        client.setLogo(logoFileName);
                    } catch (IOException e) {
                        log.error("Error uploading logo for client ID {}: {}", id, e.getMessage(), e);
                        model.addAttribute("error", "Error uploading logo: " + e.getMessage());
                        model.addAttribute("clientId", id);
                        return "user/edit";
                    }
                } else {
                    client.setLogo(clientDao.getExistingLogo());
                    log.debug("Keeping existing logo for client ID: {}", id);
                }
                // Generate a unique client link
                String uniqueLink = "/user/view/" + client.getName().replaceAll("\\s", "-").toLowerCase();
                client.setGenerateLink(uniqueLink);
                clientRepo.save(client);
                log.info("Successfully updated client ID: {}", id);
            } else {
                log.error("Client not found for ID: {}", id);
                return "redirect:/user/home?error=notfound";
            }
            return "redirect:/user/home";
        } catch (Exception e) {
            log.error("Unexpected error updating client ID {}: {}", id, e.getMessage(), e);
            model.addAttribute("error", "Unexpected error: " + e.getMessage());
            model.addAttribute("clientId", id);
            return "user/edit";
        }
    }

    @GetMapping("/delete/{id}")
    public String deleteClient(@PathVariable("id") int id) {
        try {
            clientRepo.deleteById(id);
            log.info("Successfully deleted client ID: {}", id);
            return "redirect:/user/home";
        } catch (Exception e) {
            log.error("Error deleting client ID {}: {}", id, e.getMessage(), e);
            return "redirect:/user/home?error=deletefailed";
        }
    }

    @PostMapping("/delete/{id}")
    public String removeClient(@PathVariable("id") int id) {
        return deleteClient(id);
    }

    @GetMapping("/search")
    public String searchClients(@RequestParam("query") String query,
                                @RequestParam(defaultValue = "0") int page,
                                @RequestParam(defaultValue = "10") int size,
                                Model model) {
        try {
            log.info("Searching clients for query: '{}' (Page: {}, Size: {})", query, page, size);

            if (size > 50) size = 50;
            if (size < 1) size = 10;

            var pageable = PageRequest.of(page, size);
            var searchResults = clientRepo.findByNameContainingIgnoreCaseOrMobileContainingOrEmailContainingIgnoreCase(
                    query, query, query, pageable);

            log.debug("Found {} results for query '{}'", searchResults.getNumberOfElements(), query);

            model.addAttribute("clients", searchResults);
            model.addAttribute("currentPage", page);
            model.addAttribute("pageSize", size);
            model.addAttribute("searchQuery", query);
            model.addAttribute("resourceURL", resourceAccessUrl);

            return "user/home";
        } catch (Exception e) {
            log.error("Error searching clients for query '{}': {}", query, e.getMessage(), e);
            return "redirect:/user/home?error=searchFailed";
        }
    }

    @PostMapping("/download-csv")
    public ResponseEntity<org.springframework.core.io.Resource> downloadClientLogs(@RequestParam Long clientId, HttpServletRequest request) {
        try {
            Optional<Client> clientOptional = clientRepo.findById(clientId);
            if (!clientOptional.isPresent()) {
                log.warn("Client not found with ID: {}", clientId);
                return ResponseEntity.notFound().build();
            }

            Client client = clientOptional.get();
            log.info("Downloading CSV for client: {} (ID: {})", client.getName(), clientId);

            List<ReviewGenerationLog> logs = reviewLogRepository.findByCompanyName(client.getName())
                    .stream()
                    .sorted(Comparator.comparing(ReviewGenerationLog::getTimestamp, Comparator.reverseOrder()))
                    .collect(Collectors.toList());
            log.info("Found {} logs for client: {}", logs.size(), client.getName());

            StringBuilder csvContent = new StringBuilder();
            csvContent.append("ID,Company,Timestamp,Review Length,Key Points,Regenerated\n");

            DateTimeFormatter indianDateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

            for (ReviewGenerationLog logEntry : logs) {
                csvContent.append(escapeCSVValue(logEntry.getId() != null ? logEntry.getId().toString() : "")).append(",")
                        .append(escapeCSVValue(logEntry.getCompanyName() != null ? logEntry.getCompanyName() : "")).append(",")
                        .append(escapeCSVValue(logEntry.getTimestamp() != null ?
                                logEntry.getTimestamp().format(indianDateFormatter) : "")).append(",")
                        .append(escapeCSVValue(logEntry.getReviewLength() != null ? logEntry.getReviewLength().toString() : "")).append(",")
                        .append(escapeCSVValue(logEntry.getKeyPoints() != null ? logEntry.getKeyPoints() : "")).append(",")
                        .append(escapeCSVValue(logEntry.getRegenerated() != null ? logEntry.getRegenerated().toString() : "false")).append("\n");
            }

            if (logs.isEmpty()) {
                csvContent.append("No logs found for ").append(escapeCSVValue(client.getName())).append("\n");
            }

            byte[] bom = {(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};
            byte[] csvBytes = csvContent.toString().getBytes(StandardCharsets.UTF_8);
            byte[] csvWithBom = new byte[bom.length + csvBytes.length];
            System.arraycopy(bom, 0, csvWithBom, 0, bom.length);
            System.arraycopy(csvBytes, 0, csvWithBom, bom.length, csvBytes.length);

            ByteArrayResource resource = new ByteArrayResource(csvWithBom);

            String filename = sanitizeFilename(client.getName()) + "_logs_" +
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";

            log.info("Generated CSV file: {} with {} bytes", filename, csvWithBom.length);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, "text/csv; charset=utf-8")
                    .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                    .header(HttpHeaders.PRAGMA, "no-cache")
                    .header(HttpHeaders.EXPIRES, "0")
                    .contentLength(csvWithBom.length)
                    .body(resource);

        } catch (Exception e) {
            log.error("Error downloading CSV for client ID: {}", clientId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private String escapeCSVValue(String value) {
        if (value == null || value.trim().isEmpty()) {
            return "";
        }

        value = value.trim();

        if (value.contains(",") || value.contains("\n") || value.contains("\r") || value.contains("\"")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }

        return value;
    }

    private String sanitizeFilename(String filename) {
        if (filename == null || filename.trim().isEmpty()) {
            return "client";
        }

        String sanitized = filename.trim()
                .replaceAll("[^a-zA-Z0-9\\-_\\s]", "_")
                .replaceAll("\\s+", "_")
                .replaceAll("_{2,}", "_")
                .replaceAll("^_|_$", "");

        return sanitized.isEmpty() ? "client" : sanitized;
    }

    @GetMapping("/download-csv/{id}")
    public ResponseEntity<org.springframework.core.io.Resource> downloadClientLogsGet(@PathVariable("id") Long clientId, HttpServletRequest request) {
        return downloadClientLogs(clientId, request);
    }

    /**
     * Generate review from voice recording
     */
    @PostMapping("/generate-review-from-voice/{clientName}")
    @ResponseBody
    public ResponseEntity<VoiceReviewResponse> generateReviewFromVoice(
            @PathVariable String clientName,
            @RequestParam("audio") MultipartFile audioFile,
            @RequestParam(value = "language", required = false, defaultValue = "auto") String language) {
        
        try {
            log.info("Received voice review request for client: {}", clientName);
            
            // Check if voice feature is enabled
            if (!isVoiceFeatureEnabled()) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(new VoiceReviewResponse("Voice feature is currently disabled"));
            }
            
            // Generate review
            VoiceReviewResponse response = reviewGeneratorService.generateReviewFromVoice(
                clientName, 
                audioFile, 
                language
            );
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("Error processing voice review", e);
            return ResponseEntity.internalServerError()
                .body(new VoiceReviewResponse("Server error: " + e.getMessage()));
        }
    }

    /**
     * Check if voice feature is enabled
     */
    private boolean isVoiceFeatureEnabled() {
        // Check from application.properties
        return environment.getProperty("feature.voice.enabled", Boolean.class, false) &&
               whisperClientService.isServiceHealthy();
    }

    /**
     * Health check for voice feature
     */
    @GetMapping("/voice-health")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> checkVoiceHealth() {
        Map<String, Object> health = new HashMap<>();
        
        boolean featureEnabled = environment.getProperty("feature.voice.enabled", Boolean.class, false);
        boolean serviceHealthy = whisperClientService.isServiceHealthy();
        
        health.put("featureEnabled", featureEnabled);
        health.put("serviceHealthy", serviceHealthy);
        health.put("status", (featureEnabled && serviceHealthy) ? "available" : "unavailable");
        
        return ResponseEntity.ok(health);
    }
}