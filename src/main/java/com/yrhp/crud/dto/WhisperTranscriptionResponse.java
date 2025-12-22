package com.yrhp.crud.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class WhisperTranscriptionResponse {
    private boolean success;
    private String text;
    private String language;
    
    @JsonProperty("language_probability")
    private double languageProbability;
    
    private double duration;
    private String error;
    
    public WhisperTranscriptionResponse() {
    }
    
    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getText() {
        return text;
    }
    
    public void setText(String text) {
        this.text = text;
    }
    
    public String getLanguage() {
        return language;
    }
    
    public void setLanguage(String language) {
        this.language = language;
    }
    
    public double getLanguageProbability() {
        return languageProbability;
    }
    
    public void setLanguageProbability(double languageProbability) {
        this.languageProbability = languageProbability;
    }
    
    public double getDuration() {
        return duration;
    }
    
    public void setDuration(double duration) {
        this.duration = duration;
    }
    
    public String getError() {
        return error;
    }
    
    public void setError(String error) {
        this.error = error;
    }
}
