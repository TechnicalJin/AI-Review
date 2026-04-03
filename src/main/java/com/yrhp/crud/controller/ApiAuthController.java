package com.yrhp.crud.controller;

import com.yrhp.crud.model.Client;
import com.yrhp.crud.model.UserDtls;
import com.yrhp.crud.repository.ClientRepository;
import com.yrhp.crud.repository.UserRepository;
import com.yrhp.crud.service.ApiTokenService;
import com.yrhp.crud.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class ApiAuthController {

    private static final Logger log = LoggerFactory.getLogger(ApiAuthController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ApiTokenService apiTokenService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");

            log.info("API Login attempt for email: {}", email);

            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email and password are required"));
            }

            // First, try to find in UserDtls table (USER role)
            UserDtls user = userRepository.findByEmail(email);

            if (user != null) {
                // Found in UserDtls table
                if (!passwordEncoder.matches(password, user.getPassword())) {
                    log.warn("Invalid password for user: {}", email);
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("message", "Invalid email or password"));
                }

                // Get role without ROLE_ prefix
                String role = user.getRole();
                if (role != null && role.startsWith("ROLE_")) {
                    role = role.substring(5);
                }

                String token = apiTokenService.issueToken(user.getEmail(), role);

                Map<String, Object> response = new HashMap<>();
                response.put("id", user.getId());
                response.put("username", user.getUsername());
                response.put("email", user.getEmail());
                response.put("mobile", user.getMobile());
                response.put("role", role);
                response.put("token", token);

                log.info("API Login successful for USER: {}", email);
                return ResponseEntity.ok(response);
            }

            // Not found in UserDtls, try Client table
            Optional<Client> clientOpt = clientRepository.findByEmail(email);

            if (clientOpt.isPresent()) {
                Client client = clientOpt.get();

                if (!passwordEncoder.matches(password, client.getPassword())) {
                    log.warn("Invalid password for client: {}", email);
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("message", "Invalid email or password"));
                }

                // Get role without ROLE_ prefix
                String role = client.getRole();
                if (role != null && role.startsWith("ROLE_")) {
                    role = role.substring(5);
                }

                String token = apiTokenService.issueToken(client.getEmail(), role);

                Map<String, Object> response = new HashMap<>();
                response.put("id", client.getId());
                response.put("username", client.getName());
                response.put("email", client.getEmail());
                response.put("mobile", client.getMobile());
                response.put("role", role);
                response.put("token", token);

                log.info("API Login successful for CLIENT: {}", email);
                return ResponseEntity.ok(response);
            }

            // Not found in either table
            log.warn("User/Client not found: {}", email);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));

        } catch (Exception e) {
            log.error("Login error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> userData) {
        try {
            String username = userData.get("username");
            String email = userData.get("email");
            String password = userData.get("password");
            String mobile = userData.get("mobile");

            log.info("API Registration attempt for email: {}", email);

            // Validation
            if (username == null || email == null || password == null || mobile == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "All fields are required"));
            }

            if (userService.checkEmail(email)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email already registered"));
            }

            // Create user
            UserDtls user = new UserDtls();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(password);
            user.setMobile(mobile);

            UserDtls savedUser = userService.createUser(user);

            Map<String, Object> response = new HashMap<>();
            response.put("id", savedUser.getId());
            response.put("username", savedUser.getUsername());
            response.put("email", savedUser.getEmail());
            response.put("message", "Registration successful");

            log.info("API Registration successful for user: {}", email);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            log.error("Registration error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }
}
