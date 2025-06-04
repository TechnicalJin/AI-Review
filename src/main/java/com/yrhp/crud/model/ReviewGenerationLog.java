package com.yrhp.crud.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "review_generation_logs")
public class ReviewGenerationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "review_length")
    private String reviewLength; // short/medium/large

    @Column(name = "key_points", columnDefinition = "TEXT")
    private String keyPoints;

    @Column(name = "regenerated", nullable = false, length = 3)
    private String regenerated = "no";

    public ReviewGenerationLog() {}

    public ReviewGenerationLog(String companyName, LocalDateTime timestamp) {
        this.companyName = companyName;
        this.timestamp = timestamp;
    }

    public ReviewGenerationLog(String companyName, LocalDateTime timestamp,
                               String reviewLength, String keyPoints, String regenerated) {
        this.companyName = companyName;
        this.timestamp = timestamp;
        this.reviewLength = reviewLength;
        this.keyPoints = keyPoints;
        this.regenerated = regenerated;
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getReviewLength() {
        return reviewLength;
    }

    public void setReviewLength(String reviewLength) {
        this.reviewLength = reviewLength;
    }

    public String getKeyPoints() {
        return keyPoints;
    }

    public void setKeyPoints(String keyPoints) {
        this.keyPoints = keyPoints;
    }

    public String getRegenerated() {
        return regenerated;
    }

    public void setRegenerated(String regenerated) {
        this.regenerated = regenerated;
    }
}
