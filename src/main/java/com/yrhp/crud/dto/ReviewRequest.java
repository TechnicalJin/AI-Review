package com.yrhp.crud.dto;

import java.util.List;

public class ReviewRequest {
    private Long clientId;
    private String mode;  // "auto" or "manual"
    private List<String> selectedTags;
    private String reviewLength;  // "short", "medium", "large"
    
    public ReviewRequest() {}
    
    // Getters and Setters
    public Long getClientId() { return clientId; }
    public void setClientId(Long clientId) { this.clientId = clientId; }
    
    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
    
    public List<String> getSelectedTags() { return selectedTags; }
    public void setSelectedTags(List<String> selectedTags) { this.selectedTags = selectedTags; }
    
    public String getReviewLength() { return reviewLength; }
    public void setReviewLength(String reviewLength) { this.reviewLength = reviewLength; }
}