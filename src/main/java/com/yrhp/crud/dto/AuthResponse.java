package com.yrhp.crud.dto;

public class AuthResponse {
    private String token;
    private String email;
    private String role;
    private long expiresIn;
    
    public AuthResponse(String token, String email, String role, long expiresIn) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.expiresIn = expiresIn;
    }
    
    // Getters and setters
    public String getToken() { return token; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public long getExpiresIn() { return expiresIn; }
}