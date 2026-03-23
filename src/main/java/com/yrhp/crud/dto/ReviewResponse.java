package com.yrhp.crud.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ReviewResponse {
    private String review;
    private List<String> keyPoints;
    private String length;
    private LocalDateTime generatedAt;
    
    public ReviewResponse(String review, List<String> keyPoints, String length) {
        this.review = review;
        this.keyPoints = keyPoints;
        this.length = length;
        this.generatedAt = LocalDateTime.now();
    }
    
    // Getters
    public String getReview() { return review; }
    public List<String> getKeyPoints() { return keyPoints; }
    public String getLength() { return length; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
}