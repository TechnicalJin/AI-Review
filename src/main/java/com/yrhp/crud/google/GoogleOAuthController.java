package com.yrhp.crud.google;

import com.yrhp.crud.google.GoogleOAuthService;
import com.yrhp.crud.model.Client;
import com.yrhp.crud.repository.ClientRepository;
import com.yrhp.crud.repository.GoogleReplyLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class GoogleOAuthController {

    private static final Logger log = LoggerFactory.getLogger(GoogleOAuthController.class);

    private final GoogleOAuthService oAuthService;
    private final ClientRepository clientRepository;
    private final GoogleReplyLogRepository logRepository;

    public GoogleOAuthController(GoogleOAuthService oAuthService,
                                 ClientRepository clientRepository,
                                 GoogleReplyLogRepository logRepository) {
        this.oAuthService = oAuthService;
        this.clientRepository = clientRepository;
        this.logRepository = logRepository;
    }

    // ═══════════════════════════════════════════════════
    //  ADMIN ROUTES  — /user/google/**  (ROLE_USER)
    // ═══════════════════════════════════════════════════

    /** Admin views Google settings for a specific client */
    @GetMapping("/user/google/settings/{clientId}")
    public String adminGoogleSettings(@PathVariable int clientId, Model model) {
        Client client = clientRepository.findById(clientId).orElseThrow();
        model.addAttribute("client", client);
        model.addAttribute("connectUrl", oAuthService.buildAuthorizationUrl(clientId));
        model.addAttribute("googleClientId", oAuthService.getClientId());
        return "user/google-settings";
    }

    /** Admin callback — Google redirects here after admin connects on behalf of client */
    @GetMapping("/user/google/callback")
    public String adminHandleCallback(@RequestParam String code,
                                      @RequestParam String state,
                                      RedirectAttributes ra) {
        try {
            int clientId = Integer.parseInt(state);
            oAuthService.exchangeCodeAndFetchBusinessData(code, clientId, false);
            ra.addFlashAttribute("success",
                    "Google account connected! Business data fetched automatically.");
        } catch (Exception e) {
            log.error("Admin OAuth callback error: {}", e.getMessage(), e);
            ra.addFlashAttribute("error", "Failed to connect Google: " + e.getMessage());
        }
        return "redirect:/user/home";
    }

    /** Admin toggles auto-reply on/off for a client */
    @PostMapping("/user/google/toggle/{clientId}")
    public String adminToggleAutoReply(@PathVariable int clientId,
                                       @RequestParam boolean enabled,
                                       RedirectAttributes ra) {
        Client client = clientRepository.findById(clientId).orElseThrow();
        client.setAutoReplyEnabled(enabled);
        clientRepository.save(client);
        ra.addFlashAttribute("success",
                "Auto-reply " + (enabled ? "ENABLED" : "DISABLED") + " for " + client.getName());
        return "redirect:/user/google/settings/" + clientId;
    }

    /** Admin saves reply style override */
    @PostMapping("/user/google/style/{clientId}")
    public String adminSaveStyle(@PathVariable int clientId,
                                 @RequestParam String replyStyle,
                                 RedirectAttributes ra) {
        Client client = clientRepository.findById(clientId).orElseThrow();
        client.setGoogleReplyStyle(replyStyle);
        clientRepository.save(client);
        ra.addFlashAttribute("success", "Reply style updated.");
        return "redirect:/user/google/settings/" + clientId;
    }

    /** Admin views reply logs for any specific client */
    @GetMapping("/user/google/logs/{clientId}")
    public String adminViewLogs(@PathVariable int clientId, Model model) {
        Client client = clientRepository.findById(clientId).orElseThrow();
        model.addAttribute("client", client);
        model.addAttribute("logs",
                logRepository.findByClientIdOrderByRepliedAtDesc(clientId));
        return "user/google-logs";
    }

    // ═══════════════════════════════════════════════════
    //  CLIENT ROUTES  — /client/google/**  (ROLE_CLIENT)
    // ═══════════════════════════════════════════════════

    /** Client views their own Google connect page */
    @GetMapping("/client/google/connect")
    public String clientGoogleConnectPage(Model model) {
        Client client = getAuthenticatedClient();
        model.addAttribute("client", client);
        model.addAttribute("connectUrl",
                oAuthService.buildClientAuthorizationUrl(client.getId()));
        model.addAttribute("googleClientId", oAuthService.getClientId());
        model.addAttribute("logs",
            logRepository.findByClientIdOrderByRepliedAtDesc(client.getId()));
        return "client/client-google-connect";
    }

    /**
     * Client callback — Google redirects here after client connects.
     * State format: "client_{clientDbId}"
     */
    @GetMapping("/client/google/callback")
    public String clientHandleCallback(@RequestParam String code,
                                       @RequestParam String state,
                                       RedirectAttributes ra) {
        try {
            // State is "client_2", "client_5" etc.
            int clientId = Integer.parseInt(state.replace("client_", ""));
            oAuthService.exchangeCodeAndFetchBusinessData(code, clientId, true);

            Client client = clientRepository.findById(clientId).orElseThrow();
            String msg = "Google connected!";
            if (client.getGoogleBusinessName() != null) {
                msg = "Connected: " + client.getGoogleBusinessName();
            }
            ra.addFlashAttribute("success", msg);
        } catch (Exception e) {
            log.error("Client OAuth callback error: {}", e.getMessage(), e);
            ra.addFlashAttribute("error", "Failed to connect Google: " + e.getMessage());
        }
        return "redirect:/client/google/connect";
    }

    /** Client views only their own reply logs */
    @GetMapping("/client/google/logs")
    public String clientViewLogs(Model model) {
        Client client = getAuthenticatedClient();
        model.addAttribute("client", client);
        model.addAttribute("connectUrl",
            oAuthService.buildClientAuthorizationUrl(client.getId()));
        model.addAttribute("googleClientId", oAuthService.getClientId());
        model.addAttribute("logs",
                logRepository.findByClientIdOrderByRepliedAtDesc(client.getId()));
        return "client/client-google-connect";
    }

    // ═══════════════════════════════════════════════════
    //  HELPER
    // ═══════════════════════════════════════════════════

    /**
     * Gets the currently authenticated Client from the database.
     * Works because ROLE_CLIENT users are stored in the clients table.
     */
    private Client getAuthenticatedClient() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName(); // Spring Security stores the username (email)
        return clientRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated client not found for email: " + email));
    }
}