package com.yrhp.crud.controller;

import com.yrhp.crud.dao.ClientDao;
import com.yrhp.crud.model.Client;
import com.yrhp.crud.model.ReviewGenerationLog;
import com.yrhp.crud.model.UserDtls;
import com.yrhp.crud.repository.ClientRepository;
import com.yrhp.crud.repository.ReviewGenerationLogRepository;
import com.yrhp.crud.repository.UserRepository;
import com.yrhp.crud.service.ReviewGeneratorService;
import com.yrhp.crud.dto.RegenerateReviewRequest;
// import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
// import org.springframework.http.HttpStatus;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import com.yrhp.crud.exception.ResourceNotFoundException;

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


    /**********      CRUD        **********/




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

            String logoFileName = System.currentTimeMillis() + "_" + logo.getOriginalFilename();
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
            @RequestParam(required = false) String reviewLink
    ) {
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
    }

    @GetMapping("/view/{name}")
    public String viewClient(@PathVariable("name") String name, Model model) {
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
        if(existingReview == null || existingReview.isEmpty()){
            String review = reviewGeneratorService.generateReview(client.getId());
            model.addAttribute("review", review);
        }

        return "user/view";
    }

    /*@GetMapping("/regenerate/{id}")
    public String regenerateReview(@PathVariable("id") int id, Model model) {
        String review = reviewGeneratorService.generateReview(id);
        model.addAttribute("review", review);

        Optional<Client> clientOptional = clientRepo.findById(id);
        if (clientOptional.isPresent()) {
            model.addAttribute("client", clientOptional.get()); // Add client to the model
        }
        return "user/view"; // Return to the view page
    }*/

    @GetMapping("/test/{id}")
    @ResponseBody
    public String test(@PathVariable("id") int id) {
        return "Test ID: " + id;
    }

    @PostMapping("/regenerate/{id}")
    public @ResponseBody String regenerateReview(
            @PathVariable("id") int id,
            @RequestBody RegenerateReviewRequest request) {
        log.info("Regenerating review for client ID: {} with {} tags", id, request.getSelectedTags().size());

        if (request.getSelectedTags() == null || request.getSelectedTags().size() < 3) {
            log.warn("Insufficient tags selected for client ID: {} - only {} tags provided",
                    id, request.getSelectedTags() != null ? request.getSelectedTags().size() : 0);
            throw new IllegalArgumentException("At least 3 tags must be selected");
        }
//        return reviewGeneratorService.generateReviewWithTags(id, request.getSelectedTags(), request.getReviewLength());
        return reviewGeneratorService.generateReviewWithTags(id, request.getSelectedTags(), request.getReviewLength(), true);
    }

    @PostMapping("/generate")
    public @ResponseBody String generateReview(
            @RequestParam int clientId,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(defaultValue = "medium") String reviewLength) {

        if (tags != null && !tags.isEmpty()) {
            // Tag-based generation (initial)
            return reviewGeneratorService.generateReviewWithTags(clientId, tags, reviewLength);
        } else {
            // Normal generation
            return reviewGeneratorService.generateReview(clientId);
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
    }

    @GetMapping("/edit/{id}")
    public String editClient(@PathVariable("id") int id, Model model) {
        Optional<Client> optionalClient = clientRepo.findById(id);

        if (optionalClient.isPresent()) {
            Client client = optionalClient.get();
            ClientDao clientDao = new ClientDao();

            clientDao.setName(client.getName());
            clientDao.setEmail(client.getEmail());
            clientDao.setPassword(client.getPassword());
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
            return "redirect:/user?error=notfound";
        }
    }

    @PostMapping("/edit/{id}")
    public String updateClient(@PathVariable("id") int id,
                               @ModelAttribute("clientDao") @Valid ClientDao clientDao,
                               BindingResult result, Model model) {
        log.info("Updating client ID: {}", id);

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
                return "user/edit";
            }

            Optional<Client> existingEmailClient = clientRepo.findByEmail(clientDao.getEmail());
            if (existingEmailClient.isPresent() && existingEmailClient.get().getId() != id) {
                model.addAttribute("error", "A client with this email already exists.");
                return "user/edit";
            }

            Optional<Client> existingMobileClient = clientRepo.findByMobile(clientDao.getMobile());
            if (existingMobileClient.isPresent() && existingMobileClient.get().getId() != id) {
                model.addAttribute("error", "A client with this mobile number already exists.");
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
                    log.info("Only JPG and PNG images are allowed.");
                    model.addAttribute("error", "Only JPG and PNG images are allowed.");
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
                }
            } else {
                client.setLogo(clientDao.getExistingLogo()); // Keep the existing logo
                log.warn("Keeping Existing Logo for ID: {}", id);
            }

            // Generate a unique client link
            String uniqueLink = "/user/view/" + client.getName().replaceAll("\\s", "-").toLowerCase();
            client.setGenerateLink(uniqueLink);

            clientRepo.save(client);
        }

        return "redirect:/user/home";
    }



    @GetMapping("/delete/{id}")
    public String deleteClient(@PathVariable("id") int id) {
        clientRepo.deleteById(id);
        return "redirect:/user/home";
    }


    @PostMapping("/delete/{id}")
    public String removeClient(@PathVariable("id") int id) {
        log.info("Attempting to delete client ID: {}", id);

        try {
            clientRepo.deleteById(id);
            log.info("Successfully deleted client ID: {}", id);
        } catch (Exception e) {
            log.error("Error deleting client ID {}: {}", id, e.getMessage(), e);
            return "redirect:/user/home?error=deletefailed";
        }
        return "redirect:/user/home";
    }


    @GetMapping("/search")
    public String searchClients(@RequestParam("query") String query,
                                @RequestParam(defaultValue = "0") int page,
                                @RequestParam(defaultValue = "10") int size,
                                Model model) {

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
    }
}