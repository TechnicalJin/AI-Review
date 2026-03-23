package com.yrhp.crud.controller;

import com.yrhp.crud.dto.LoginRequest;
import com.yrhp.crud.dto.AuthResponse;
import com.yrhp.crud.model.UserDtls;
import com.yrhp.crud.repository.UserRepository;
import com.yrhp.crud.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        UserDtls user = userRepository.findByEmail(request.getEmail());

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body(new Object() {
                public String error = "Invalid credentials";
            });
        }

        String token = tokenProvider.generateToken(user.getEmail(), user.getRole());
        long expiresIn = 24 * 60 * 60 * 1000; // 24 hours

        return ResponseEntity.ok(new AuthResponse(
                token,
                user.getEmail(),
                user.getRole(),
                expiresIn
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        String email = (String) org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        UserDtls user = userRepository.findByEmail(email);

        return ResponseEntity.ok(new Object() {
            public String userEmail = user.getEmail();
            public String userName = user.getUsername();
            public String role = user.getRole();
        });
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(new Object() {
            public String message = "Logged out successfully";
        });
    }
}