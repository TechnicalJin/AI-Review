package com.yrhp.crud.dao;

import jakarta.validation.constraints.*;
import org.springframework.web.multipart.MultipartFile;

public class ClientDao {

    @NotEmpty(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotEmpty(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotEmpty(message = "Mobile number is required")
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

    private String chatText;

    private String generateLink;

    // Getters and Setters

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
}
