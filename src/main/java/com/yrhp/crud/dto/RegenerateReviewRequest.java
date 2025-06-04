package com.yrhp.crud.dto;

import java.util.List;

public class RegenerateReviewRequest {
    private List<String> selectedTags;
    private String reviewLength;

    public List<String> getSelectedTags() {
        return selectedTags;
    }

    public void setSelectedTags(List<String> selectedTags) {
        this.selectedTags = selectedTags;
    }

    public String getReviewLength() {
        return reviewLength;
    }

    public void setReviewLength(String reviewLength) {
        this.reviewLength = reviewLength;
    }
} 