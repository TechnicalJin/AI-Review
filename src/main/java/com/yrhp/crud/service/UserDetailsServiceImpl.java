package com.yrhp.crud.service;

import com.yrhp.crud.config.CustomClientDetails;
import com.yrhp.crud.config.CustomUserDetails;
import com.yrhp.crud.model.Client;
import com.yrhp.crud.model.UserDtls;
import com.yrhp.crud.repository.ClientRepository;
import com.yrhp.crud.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(UserDetailsServiceImpl.class);

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ClientRepository clientRepo;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        try {
            logger.debug("Attempting to load user by email: {}", email);
            
            // First, try to find in UserRepository (for ROLE_USER)
            UserDtls user = userRepo.findByEmail(email);
            if (user != null) {
                logger.info("User found in UserRepository with email: {}", email);
                return new CustomUserDetails(user);
            }
            
            // If not found, try to find in ClientRepository (for ROLE_CLIENT)
            Optional<Client> clientOpt = clientRepo.findByEmail(email);
            if (clientOpt.isPresent()) {
                Client client = clientOpt.get();
                logger.info("Client found in ClientRepository with email: {}", email);
                return new CustomClientDetails(client);
            }
            
            logger.warn("No user or client found with email: {}", email);
            throw new UsernameNotFoundException("User or Client not found with email: " + email);
        } catch (UsernameNotFoundException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error loading user by username: {}", e.getMessage(), e);
            throw new UsernameNotFoundException("Error loading user by username: " + e.getMessage(), e);
        }
    }
}