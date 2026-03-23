package com.yrhp.crud.dto;

public class ClientPublicDTO {
    private Long id;
    private String name;
    private String logoUrl;
    private String chatText;
    private String reviewLink;
    private String generateLink;
    
    public ClientPublicDTO(Long id, String name, String logoUrl, String chatText, String reviewLink, String generateLink) {
        this.id = id;
        this.name = name;
        this.logoUrl = logoUrl;
        this.chatText = chatText;
        this.reviewLink = reviewLink;
        this.generateLink = generateLink;
    }
    
    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getLogoUrl() { return logoUrl; }
    public String getChatText() { return chatText; }
    public String getReviewLink() { return reviewLink; }
    public String getGenerateLink() { return generateLink; }
}