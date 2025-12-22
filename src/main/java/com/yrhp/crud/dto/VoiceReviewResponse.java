package com.yrhp.crud.dto;

public class VoiceReviewResponse {
    private boolean success;
    private String review;
    private String transcription;
    private String detectedLanguage;
    private double languageConfidence;
    private double audioDuration;
    private String error;
    
    public VoiceReviewResponse() {
    }
    
    // Success constructor
    public VoiceReviewResponse(String review, String transcription, String detectedLanguage, 
                               double languageConfidence, double audioDuration) {
        this.success = true;
        this.review = review;
        this.transcription = transcription;
        this.detectedLanguage = detectedLanguage;
        this.languageConfidence = languageConfidence;
        this.audioDuration = audioDuration;
    }
    
    // Error constructor
    public VoiceReviewResponse(String error) {
        this.success = false;
        this.error = error;
    }
    
    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getReview() {
        return review;
    }
    
    public void setReview(String review) {
        this.review = review;
    }
    
    public String getTranscription() {
        return transcription;
    }
    
    public void setTranscription(String transcription) {
        this.transcription = transcription;
    }
    
    public String getDetectedLanguage() {
        return detectedLanguage;
    }
    
    public void setDetectedLanguage(String detectedLanguage) {
        this.detectedLanguage = detectedLanguage;
    }
    
    public double getLanguageConfidence() {
        return languageConfidence;
    }
    
    public void setLanguageConfidence(double languageConfidence) {
        this.languageConfidence = languageConfidence;
    }
    
    public double getAudioDuration() {
        return audioDuration;
    }
    
    public void setAudioDuration(double audioDuration) {
        this.audioDuration = audioDuration;
    }
    
    public String getError() {
        return error;
    }
    
    public void setError(String error) {
        this.error = error;
    }
}