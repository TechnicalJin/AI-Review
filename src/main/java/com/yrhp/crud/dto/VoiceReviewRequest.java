package com.yrhp.crud.dto;

import org.springframework.web.multipart.MultipartFile;

public class VoiceReviewRequest {
    private MultipartFile audioFile;
    private String language; // Optional: "hi", "gu", "en", or "auto"
    private String tone; // Optional: "professional", "friendly", etc.
    
    public VoiceReviewRequest() {
    }
    
    public VoiceReviewRequest(MultipartFile audioFile, String language, String tone) {
        this.audioFile = audioFile;
        this.language = language;
        this.tone = tone;
    }
    
    // Getters and Setters
    public MultipartFile getAudioFile() {
        return audioFile;
    }
    
    public void setAudioFile(MultipartFile audioFile) {
        this.audioFile = audioFile;
    }
    
    public String getLanguage() {
        return language;
    }
    
    public void setLanguage(String language) {
        this.language = language;
    }
    
    public String getTone() {
        return tone;
    }
    
    public void setTone(String tone) {
        this.tone = tone;
    }
}
