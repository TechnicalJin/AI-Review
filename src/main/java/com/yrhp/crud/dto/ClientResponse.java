package com.yrhp.crud.dto;

import java.time.LocalDateTime;

public class ClientResponse {
    private Long id;
    private String name;
    private String email;
    private String mobile;
    private String reviewLink;
    private String chatText;
    private String logoUrl;
    private String generateLink;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public ClientResponse(Long id, String name, String email, String mobile, 
                         String reviewLink, String chatText, String logoUrl, String generateLink) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.mobile = mobile;
        this.reviewLink = reviewLink;
        this.chatText = chatText;
        this.logoUrl = logoUrl;
        this.generateLink = generateLink;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // All getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getMobile() { return mobile; }
    public String getReviewLink() { return reviewLink; }
    public String getChatText() { return chatText; }
    public String getLogoUrl() { return logoUrl; }
    public String getGenerateLink() { return generateLink; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}