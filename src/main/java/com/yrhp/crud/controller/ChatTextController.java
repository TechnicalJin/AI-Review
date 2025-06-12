package com.yrhp.crud.controller;

import com.yrhp.crud.model.Client;
import com.yrhp.crud.service.ClientService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/client")
public class ChatTextController {

    private static final Logger log = LoggerFactory.getLogger(ChatTextController.class);

    @Autowired
    private ClientService clientService;

    @GetMapping("/chatText")
    public String showChatTextForm(Authentication authentication, Model model) {
        try {
            Client client = clientService.getClientByEmail(authentication.getName());
            model.addAttribute("client", client);
            model.addAttribute("chatText", client.getChatText() != null ? client.getChatText() : "");
            return "client/chatText";
        } catch (Exception e) {
            log.error("Error loading chat text form: {}", e.getMessage());
            return "redirect:/client/home?error=loadFailed";
        }
    }

    @PostMapping("/chatText")
    public String updateChatText(Authentication authentication,
                                 @RequestParam("chatText") String chatText,
                                 RedirectAttributes redirectAttributes,
                                 Model model) {

        log.debug("Updating chat text for user: {} with text: {}", authentication.getName(), chatText);

        // Basic validation
        if (chatText == null || chatText.trim().isEmpty()) {
            log.warn("Chat text is empty for user: {}", authentication.getName());
            redirectAttributes.addFlashAttribute("error", "Chat text cannot be empty");
            return "redirect:/client/chatText";
        }

        if (chatText.length() > 500) {
            log.warn("Chat text too long for user: {}", authentication.getName());
            redirectAttributes.addFlashAttribute("error", "Chat text cannot exceed 500 characters");
            return "redirect:/client/chatText";
        }

        try {
            Client client = clientService.getClientByEmail(authentication.getName());
            log.debug("Found client: {} with ID: {}", client.getName(), client.getId());

            // Update chat text
            client.setChatText(chatText.trim());

            // Save the client
            Client savedClient = clientService.saveClient(client);
            log.info("Successfully updated chat text for client: {} (ID: {})", savedClient.getName(), savedClient.getId());

            redirectAttributes.addFlashAttribute("success", "Chat text updated successfully!");
            return "redirect:/client/home";

        } catch (Exception e) {
            log.error("Error updating chat text for user {}: {}", authentication.getName(), e.getMessage(), e);
            redirectAttributes.addFlashAttribute("error", "Failed to update chat text. Please try again.");
            return "redirect:/client/chatText";
        }
    }
}