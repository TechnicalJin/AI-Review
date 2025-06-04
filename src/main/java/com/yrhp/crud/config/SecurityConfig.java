package com.yrhp.crud.config;

import com.yrhp.crud.service.UserDetailsServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.lang.NonNull;

@Configuration
public class SecurityConfig {

    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

    @Value("${upload.resource.location}")
    private String resourceLocation;

    @Value("${upload.resource.handler}")
    private String resourceHandler;

    @Bean
    public UserDetailsService getUserDetailsService() {
        logger.info("Creating UserDetailsService Bean..");
        return new UserDetailsServiceImpl();
    }

    @Bean
    public BCryptPasswordEncoder getPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider getDaoAuthProvider() {
        logger.debug("Configuring DaoAuthenticationProvider");
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();
        daoAuthenticationProvider.setUserDetailsService(getUserDetailsService());
        daoAuthenticationProvider.setPasswordEncoder(getPasswordEncoder());

        logger.info("DaoAuthenticationProvider Configured with UserDetailsService and BCryptPasswordEncoder");
        return daoAuthenticationProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        logger.info("Configuring security filter chain");

        http
                .authenticationProvider(getDaoAuthProvider())
                .authorizeHttpRequests(auth -> {
                    logger.debug("Configuring authorization rules");
                    auth.requestMatchers("/", "/createUser", "/signin").permitAll()
                            .requestMatchers("/user/view/**", "/user/regenerate/**", "/uploads/**").permitAll()
                            .requestMatchers("/user/**").authenticated()
                            .requestMatchers("/register").denyAll()
                            .anyRequest().permitAll();
                    logger.info("Authorization rules configured");
                })
                .formLogin(form -> {
                    logger.debug("Configuring form login");
                    form.loginPage("/signin")
                            .loginProcessingUrl("/signin")
                            .defaultSuccessUrl("/user/home", true)
                            .permitAll();
                    logger.info("Form login configured with login page: /signin");
                })
                .logout(logout -> {
                    logger.debug("Configuring logout");
                    logout.logoutUrl("/logout")
                            .logoutSuccessUrl("/signin?logout")
                            .invalidateHttpSession(true)
                            .clearAuthentication(true)
                            .permitAll();
                    logger.info("Logout configured with URL: /logout");
                })
                .csrf(csrf -> {
                    logger.debug("Disabling CSRF protection");
                    csrf.disable();
                    logger.warn("CSRF protection is disabled");
                });

        logger.info("Security filter chain configuration completed");
        return http.build();
    }

    @Bean
    public WebMvcConfigurer configurer() {
        logger.info("Configuring resource handlers for location : {} with handler : {}", resourceLocation, resourceHandler);
        return new WebMvcConfigurer() {
            @Override
            public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
                logger.debug("Adding Resource handler : {} for location : {}", resourceHandler, resourceLocation);
                registry.addResourceHandler(resourceHandler)
                        .addResourceLocations("file:" + resourceLocation);
                logger.info("Resource handler configured successfully");
            }
        };
    }

    @Bean
    public AuthenticationConfiguration authenticationConfiguration() {
        logger.info("Creating AuthenticationConfiguration Bean");
        return new AuthenticationConfiguration();
    }
}