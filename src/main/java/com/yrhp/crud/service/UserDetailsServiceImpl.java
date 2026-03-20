package com.yrhp.crud.service;

import com.yrhp.crud.config.CustomUserDetails;
import com.yrhp.crud.model.Client;
import com.yrhp.crud.model.UserDtls;
import com.yrhp.crud.repository.ClientRepository;
import com.yrhp.crud.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private static final Logger log = LoggerFactory.getLogger(UserDetailsServiceImpl.class);

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ClientRepository clientRepo;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // 1) Admin/user login from users table
        UserDtls user = userRepo.findByEmail(email);
        if (user != null) {
            return new CustomUserDetails(user);
        }

        // 2) Client login from clients table
        Client client = clientRepo.findByEmail(email).orElse(null);
        if (client != null) {
            return new User(
                    client.getEmail(),
                    client.getPassword(),
                    List.of(new SimpleGrantedAuthority(client.getRole()))
            );
        }

        log.warn("No user/client account found for email: {}", email);
        throw new UsernameNotFoundException("User Not Available");
    }
}