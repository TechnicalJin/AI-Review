package com.yrhp.crud.service;

import com.yrhp.crud.model.UserDtls;
import com.yrhp.crud.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserDtls createUser(UserDtls user) {
        try {
            log.info("Creating user with email: {}", user.getEmail());
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            user.setRole("ROLE_USER");
            UserDtls savedUser = userRepo.save(user);
            log.info("User saved successfully: {}", user.getEmail());
            return savedUser;
        } catch (Exception e) {
            log.error("Error creating user with email {}: {}", user.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Failed to create user", e);
        }
    }

    @Override
    public boolean checkEmail(String email) {
        try {
            log.debug("Checking if email exists: {}", email);
            return userRepo.existsByEmail(email);
        } catch (Exception e) {
            log.error("Error checking if email exists {}: {}", email, e.getMessage(), e);
            throw new RuntimeException("Failed to check email existence", e);
        }
    }
}