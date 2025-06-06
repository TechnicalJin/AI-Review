package com.yrhp.crud.dao;

import jakarta.validation.constraints.*;
import org.springframework.web.multipart.MultipartFile;

public class ClientDao {

    private int id;

    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 50, message = "Name must be between 3 and 50 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Invalid mobile number format")
    private String mobile;

    @NotEmpty(message = "Review link is required")
    @Pattern(regexp = "^(http(s)?://)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)$", message = "Invalid URL format")
    private String reviewLink;

    /*@Min(value = 10, message = "Character limit must be at least 10")
    @Max(value = 1000, message = "Character limit cannot exceed 1000")
    private int reviewCharLimit;*/

    @NotNull(message = "Logo file is required.")
    private MultipartFile logo;

    private String existingLogo;

    @Size(max = 500, message = "Chat text cannot exceed 500 characters")
    private String chatText;

    private String generateLink;

    private String role = "ROLE_CLIENT"; // Default role

    // Getters and Setters

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getReviewLink() {
        return reviewLink;
    }

    public void setReviewLink(String reviewLink) {
        if (reviewLink.length() > 255) {
            throw new IllegalArgumentException("URL too long");
        }
        this.reviewLink = reviewLink;
    }

    /*public int getReviewCharLimit() {
        return reviewCharLimit;
    }

    public void setReviewCharLimit(int reviewCharLimit) {
        this.reviewCharLimit = reviewCharLimit;
    }*/

    public MultipartFile getLogo() {
        return logo;
    }

    public void setLogo(MultipartFile logo) {
        this.logo = logo;
    }

    // Getters and Setters for logo
    public String getExistingLogo() {
        return existingLogo;
    }

    public void setExistingLogo(String existingLogo) {
        this.existingLogo = existingLogo;
    }

    public String getChatText() {
        return chatText;
    }

    public void setChatText(String chatText) {
        this.chatText = chatText;
    }

    public String getGenerateLink() {
        return generateLink;
    }

    public void setGenerateLink(String generateLink) {
        this.generateLink = generateLink;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
