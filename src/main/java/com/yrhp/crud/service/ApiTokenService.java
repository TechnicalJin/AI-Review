package com.yrhp.crud.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ApiTokenService {

    private static final long TOKEN_TTL_HOURS = 12;

    private final Map<String, SessionInfo> tokenStore = new ConcurrentHashMap<>();

    public String issueToken(String email, String role) {
        String token = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plus(TOKEN_TTL_HOURS, ChronoUnit.HOURS);
        tokenStore.put(token, new SessionInfo(email, role, expiresAt));
        return token;
    }

    public Optional<String> resolveEmail(String authHeader) {
        return resolveSession(authHeader).map(SessionInfo::email);
    }

    private Optional<SessionInfo> resolveSession(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Optional.empty();
        }

        String token = authHeader.substring(7).trim();
        if (token.isEmpty()) {
            return Optional.empty();
        }

        SessionInfo info = tokenStore.get(token);
        if (info == null) {
            return Optional.empty();
        }

        if (Instant.now().isAfter(info.expiresAt())) {
            tokenStore.remove(token);
            return Optional.empty();
        }

        return Optional.of(info);
    }

    private record SessionInfo(String email, String role, Instant expiresAt) {}
}
