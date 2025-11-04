package com.yrhp.crud.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.Customizer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
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

    @Autowired
    private UserDetailsService userDetailsService;


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider getDaoAuthProvider() {
        logger.debug("Configuring DaoAuthenticationProvider");
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();
        daoAuthenticationProvider.setUserDetailsService(userDetailsService);
        daoAuthenticationProvider.setPasswordEncoder(passwordEncoder());
        logger.info("DaoAuthenticationProvider Configured with CustomUserDetailsService and BCryptPasswordEncoder");
        return daoAuthenticationProvider;
    }


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        logger.info("Configuring security filter chain");

        http
                .authenticationProvider(getDaoAuthProvider())
                .authorizeHttpRequests(auth -> {
                    logger.debug("Configuring authorization rules");
                    auth
                            // Public resources
                            .requestMatchers("/", "/createUser", "/signin",
                                    "/css/**", "/js/**", "/images/**", "/error/**", 
                                    "/uploads/**", "/Uploads/**").permitAll()
                            // Public pages
                            .requestMatchers("/user/view/**", "/user/regenerate/**").permitAll()
                            // Role-based access
                            .requestMatchers("/register").denyAll()
                            .requestMatchers("/user/**").hasRole("USER")
                            .requestMatchers("/client/**").hasRole("CLIENT")
                            .anyRequest().authenticated();
                    logger.info("Authorization rules configured");
                })
                .formLogin(form -> {
                    logger.debug("Configuring form login");
                    form.loginPage("/signin")
                            .loginProcessingUrl("/signin")
                            .defaultSuccessUrl("/", true)
                            .successHandler((request, response, authentication) -> {
                                String role = authentication.getAuthorities().iterator().next().getAuthority();
                                logger.info("User logged in with role: {}", role);
                                
                                if ("ROLE_USER".equals(role)) {
                                    response.sendRedirect("/user/home");
                                } else if ("ROLE_CLIENT".equals(role)) {
                                    response.sendRedirect("/client/home");
                                } else {
                                    response.sendRedirect("/");
                                }
                            })
                            .failureHandler((request, response, exception) -> {
                                logger.error("Login failed: {}", exception.getMessage());
                                
                                // Use relative redirect to maintain protocol
                                response.sendRedirect("/signin?error=true");
                            })
                            .permitAll();
                    logger.info("Form login configured with login page: /signin");
                })
                .logout(logout -> {
                    logger.debug("Configuring logout");
                    logout.logoutUrl("/logout")
                            .logoutSuccessUrl("/signin?logout")
                            .invalidateHttpSession(true)
                            .clearAuthentication(true)
                            .deleteCookies("JSESSIONID")
                            .permitAll();
                    logger.info("Logout configured with URL: /logout");
                })
                .exceptionHandling(exception -> {
                    exception
                            .accessDeniedPage("/error/403")
                            .authenticationEntryPoint((request, response, authException) -> {
                                logger.error("Unauthorized access attempt: {}", authException.getMessage());
                                
                                // Use relative redirect to maintain protocol
                                response.sendRedirect("/signin?error=unauthorized");
                            });
                })
                .headers(headers -> {
                    headers
                        .frameOptions(frameOptions -> frameOptions.deny())
                        .contentTypeOptions(Customizer.withDefaults())
                        .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                            .maxAgeInSeconds(31536000)
                            .includeSubDomains(true));
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
                // Add handler for both lowercase and uppercase variations
                registry.addResourceHandler(resourceHandler)
                        .addResourceLocations("file:" + resourceLocation);
                registry.addResourceHandler("/Uploads/**")
                        .addResourceLocations("file:" + resourceLocation);
                logger.info("Resource handlers configured successfully (both /uploads/** and /Uploads/**)");
            }
        };
    }

    @Bean
    public AuthenticationConfiguration authenticationConfiguration() {
        logger.info("Creating AuthenticationConfiguration Bean");
        return new AuthenticationConfiguration();
    }
}