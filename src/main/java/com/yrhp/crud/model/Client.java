package com.yrhp.crud.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "clients")
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 50, message = "Name must be between 3 and 50 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Invalid mobile number format")
    @Column(unique = true)
    private String mobile;
 
    @NotEmpty(message = "Review link is required")
    @Pattern(regexp = "^(http(s)?://)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)$", message = "Invalid URL format")
    private String reviewLink;

    /*@Min(value = 10, message = "Character limit must be at least 10")
    @Max(value = 1000, message = "Character limit cannot exceed 1000")
    private int reviewCharLimit;*/

    private String logo;

    @NotEmpty(message = "chatText is required")
    private String chatText;

    private String generateLink;

    @Column(nullable = false)
    private String role = "ROLE_CLIENT"; // Default role

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

    public String getLogo() {
        return logo;
    }

    public void setLogo(String logo) {
        this.logo = logo;
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

    @Override
    public String toString() {
        return "Client{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", mobile='" + mobile + '\'' +
                ", reviewLink='" + reviewLink + '\'' +
                /*", reviewCharLimit=" + reviewCharLimit +*/
                ", logo='" + logo + '\'' +
                ", chatText='" + chatText + '\'' +
                ", generateLink='" + generateLink + '\'' +
                ", role='" + role + '\'' +
                '}';
    }
}
