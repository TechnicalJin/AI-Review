package com.yrhp.crud.service;

import com.yrhp.crud.dao.ClientDao;
import com.yrhp.crud.model.Client;
import com.yrhp.crud.repository.ClientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Service
public class ClientService {

    private static final Logger log = LoggerFactory.getLogger(ClientService.class);

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Client saveClient(ClientDao clientDao) {
        Client client = new Client();
        client.setName(clientDao.getName());
        client.setEmail(clientDao.getEmail());
        client.setMobile(clientDao.getMobile());
        client.setReviewLink(clientDao.getReviewLink());
        /*client.setReviewCharLimit(clientDao.getReviewCharLimit());*/
        client.setChatText(clientDao.getChatText());
        client.setGenerateLink("/user/view/" + client.getName().replaceAll("\\s", "-").toLowerCase());

        return clientRepository.save(client);
    }

    public Client saveClient(Client client, MultipartFile file) throws IOException {
        if (file != null && !file.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get("uploads");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Files.copy(file.getInputStream(), uploadPath.resolve(fileName));
            client.setLogo(fileName);
        }

        // Encode password before saving
        if (client.getPassword() != null && !client.getPassword().isEmpty()) {
            client.setPassword(passwordEncoder.encode(client.getPassword()));
        }

        // Set default role if not set
        if (client.getRole() == null || client.getRole().isEmpty()) {
            client.setRole("ROLE_CLIENT");
        }

        return clientRepository.save(client);
    }

    public Client updateClient(Client client, MultipartFile file) throws IOException {
        log.debug("Updating client with ID: {}", client.getId());

        Optional<Client> existingClient = clientRepository.findById(client.getId());
        if (existingClient.isPresent()) {
            Client updatedClient = existingClient.get();
            
            // Update fields
            updatedClient.setName(client.getName());
            updatedClient.setEmail(client.getEmail());
            updatedClient.setMobile(client.getMobile());
            updatedClient.setReviewLink(client.getReviewLink());
            updatedClient.setChatText(client.getChatText());

            // Only update password if a new one is provided
            if (client.getPassword() != null && !client.getPassword().isEmpty()) {
                updatedClient.setPassword(passwordEncoder.encode(client.getPassword()));
            }

            // Handle logo update
            if (file != null && !file.isEmpty()) {
                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                Path uploadPath = Paths.get("uploads");
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                Files.copy(file.getInputStream(), uploadPath.resolve(fileName));
                updatedClient.setLogo(fileName);
            }

            return clientRepository.save(updatedClient);
        }
        return null;
    }

    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Client getClientByEmail(String email) {
        log.debug("Fetching client by email: {}", email);
        return clientRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("Client not found with email: {}", email);
                    return new RuntimeException("Client not found");
                });
    }

    @Transactional(readOnly = true)
    public Client getClientById(int id) {
        log.debug("Fetching client by ID: {}", id);
        return clientRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Client not found with ID: {}", id);
                    return new RuntimeException("Client not found");
                });
    }

    public void deleteClient(int id) {
        clientRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        log.debug("Checking if client exists with email: {}", email);
        return clientRepository.existsByEmail(email);
    }

    @Transactional(readOnly = true)
    public boolean existsByMobile(String mobile) {
        log.debug("Checking if client exists with mobile: {}", mobile);
        return clientRepository.existsByMobile(mobile);
    }

    // Add this method to ClientService
    @Transactional
    public Client saveClient(Client client) {
        log.debug("Saving client: {} with ID: {}", client.getName(), client.getId());

        try {
            Client savedClient = clientRepository.save(client);
            log.info("Successfully saved client: {} with ID: {}", savedClient.getName(), savedClient.getId());
            return savedClient;
        } catch (Exception e) {
            log.error("Error saving client: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to save client", e);
        }
    }
}