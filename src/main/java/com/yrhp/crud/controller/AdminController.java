package com.yrhp.crud.controller;

import com.yrhp.crud.dto.ClientRequest;
import com.yrhp.crud.dto.ClientResponse;
import com.yrhp.crud.model.Client;
import com.yrhp.crud.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/clients")
@PreAuthorize("hasRole('USER')")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AdminController {
    
    @Autowired
    private ClientRepository clientRepository;
    
    // GET all clients with pagination
    @GetMapping
    public ResponseEntity<?> getAllClients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<Client> clientsPage = clientRepository.findAll(PageRequest.of(page, size));
            
            List<ClientResponse> responses = clientsPage.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(new Object() {
                public List<ClientResponse> content = responses;
                public int totalPages = clientsPage.getTotalPages();
                public long totalElements = clientsPage.getTotalElements();
                public int currentPage = page;
            });
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new Object() {
                public String error = e.getMessage();
            });
        }
    }
    
    // GET single client
    @GetMapping("/{id}")
    public ResponseEntity<?> getClientById(@PathVariable Long id) {
        Client client = clientRepository.findById(id).orElse(null);
        
        if (client == null) {
            return ResponseEntity.status(404).body(new Object() {
                public String error = "Client not found";
            });
        }
        
        return ResponseEntity.ok(mapToDTO(client));
    }
    
    // POST create client
    @PostMapping
    public ResponseEntity<?> createClient(
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String mobile,
            @RequestParam String reviewLink,
            @RequestParam String chatText,
            @RequestParam(required = false) MultipartFile logo) {
        
        try {
            // Check if email already exists
            if (clientRepository.findByEmail(email) != null) {
                return ResponseEntity.status(400).body(new Object() {
                    public String error = "Email already exists";
                });
            }
            
            Client client = new Client();
            client.setName(name);
            client.setEmail(email);
            client.setPassword(password);
            client.setMobile(mobile);
            client.setReviewLink(reviewLink);
            client.setChatText(chatText);
            
            // Handle file upload
            if (logo != null && !logo.isEmpty()) {
                String logoName = handleLogoUpload(client, logo);
                client.setLogo(logoName);
            }
            
            Client saved = clientRepository.save(client);
            return ResponseEntity.status(201).body(mapToDTO(saved));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new Object() {
                public String error = e.getMessage();
            });
        }
    }
    
    // PUT update client
    @PutMapping("/{id}")
    public ResponseEntity<?> updateClient(
            @PathVariable Long id,
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String mobile,
            @RequestParam String reviewLink,
            @RequestParam String chatText,
            @RequestParam(required = false) MultipartFile logo) {
        
        try {
            Client client = clientRepository.findById(id).orElse(null);
            
            if (client == null) {
                return ResponseEntity.status(404).body(new Object() {
                    public String error = "Client not found";
                });
            }
            
            client.setName(name);
            client.setEmail(email);
            client.setMobile(mobile);
            client.setReviewLink(reviewLink);
            client.setChatText(chatText);
            
            if (logo != null && !logo.isEmpty()) {
                String logoName = handleLogoUpload(client, logo);
                client.setLogo(logoName);
            }
            
            Client updated = clientRepository.save(client);
            return ResponseEntity.ok(mapToDTO(updated));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new Object() {
                public String error = e.getMessage();
            });
        }
    }
    
    // DELETE client
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClient(@PathVariable Long id) {
        try {
            Client client = clientRepository.findById(id).orElse(null);
            
            if (client == null) {
                return ResponseEntity.status(404).body(new Object() {
                    public String error = "Client not found";
                });
            }
            
            clientRepository.delete(client);
            return ResponseEntity.ok(new Object() {
                public String message = "Client deleted successfully";
            });
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new Object() {
                public String error = e.getMessage();
            });
        }
    }
    
    // Helper methods
    private ClientResponse mapToDTO(Client client) {
        return new ClientResponse(
                (long) client.getId(),
            client.getName(),
            client.getEmail(),
            client.getMobile(),
            client.getReviewLink(),
            client.getChatText(),
            "/uploads/" + client.getId() + "/" + client.getLogo(),
            "https://maps.google.com/?cid=" + client.getId()
        );
    }
    
    private String handleLogoUpload(Client client, MultipartFile file) throws Exception {
        String uploadDir = "/opt/review-card/data/" + client.getId();
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        
        String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        File dest = new File(uploadDir + "/" + filename);
        file.transferTo(dest);
        
        return filename;
    }
}