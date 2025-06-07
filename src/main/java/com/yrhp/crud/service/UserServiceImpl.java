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
        log.info("Creating user with email: {}", user.getEmail());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("ROLE_USER");
        UserDtls savedUser = userRepo.save(user);
        log.info("User saved successfully: {}", user.getEmail());
        return savedUser;
    }

    @Override
    public boolean checkEmail(String email) {
        log.debug("Checking if email exists: {}", email);
        return userRepo.existsByEmail(email);
    }
}