package com.yrhp.crud.dto;

public class ClientRequest {
    private String name;
    private String email;
    private String password;
    private String mobile;
    private String reviewLink;
    private String chatText;
    
    public ClientRequest() {}
    
    // All getters and setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    
    public String getReviewLink() { return reviewLink; }
    public void setReviewLink(String reviewLink) { this.reviewLink = reviewLink; }
    
    public String getChatText() { return chatText; }
    public void setChatText(String chatText) { this.chatText = chatText; }
}