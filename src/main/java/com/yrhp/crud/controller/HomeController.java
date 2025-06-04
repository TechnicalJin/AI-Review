package com.yrhp.crud.controller;

import com.yrhp.crud.model.UserDtls;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class HomeController {
    private static final Logger log = LoggerFactory.getLogger(HomeController.class);

    @GetMapping("/signin")
    public String login() {
        log.info("Accessing login page");
        return "login";
    }

    @GetMapping("/register")
    public String register(Model model, HttpSession session) {
        log.info("Accessing registration page");

        model.addAttribute("user", new UserDtls());
        log.debug("Added new UserDtls to model");

        String message = (String) session.getAttribute("msg");
        if (message != null) {
            log.info("Found session message: {}", message);
            model.addAttribute("msg", message);
            session.removeAttribute("msg");
            log.debug("Cleared session message");
        }
        return "register";
    }

    @GetMapping("/")
    public String redirectToLogin() {
        log.info("Redirecting root URL to login");
        return "redirect:/signin";
    }

    @PostMapping("/createUser")
    public String createUser(@Valid @ModelAttribute("user") UserDtls user,
                             BindingResult result,
                             Model model,
                             HttpSession session) {
        log.info("Attempting to create new user: {}", user.getEmail());

        try {
            if (result.hasErrors()) {
                log.warn("Validation errors in user creation: {}", result.getAllErrors());
                return "register";
            }

            // Actual user creation logic would go here
            // userService.createUser(user);

            log.info("User created successfully: {}", user.getEmail());
            session.setAttribute("msg", "Registration successful");
            return "redirect:/signin";

        } catch (Exception e) {
            log.error("Error creating user {}: {}", user.getEmail(), e.getMessage(), e);
            session.setAttribute("msg", "Registration failed");
            return "redirect:/register";
        }
    }
}