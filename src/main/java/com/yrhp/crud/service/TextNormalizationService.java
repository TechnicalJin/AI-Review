package com.yrhp.crud.service;

import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class TextNormalizationService {
    
    // Filler words to remove (English, Hindi, Gujarati)
    private static final List<String> FILLER_WORDS = Arrays.asList(
        // English
        "um", "uh", "like", "you know", "basically", "actually", "literally",
        // Hindi
        "matlab", "toh", "haan", "nahi", "acha", "theek hai", "bas",
        // Gujarati
        "toh", "ne", "ane", "che", "e", "evo", "pela"
    );
    
    // Pattern for multiple spaces
    private static final Pattern MULTIPLE_SPACES = Pattern.compile("\\s+");
    
    /**
     * Clean and normalize transcribed text
     */
    public String normalizeText(String text) {
        if (text == null || text.trim().isEmpty()) {
            return "";
        }
        
        String normalized = text;
        
        // Step 1: Convert to lowercase for filler word matching
        String lowerText = normalized.toLowerCase();
        
        // Step 2: Remove filler words
        for (String filler : FILLER_WORDS) {
            // Remove filler word with word boundaries
            String pattern = "\\b" + Pattern.quote(filler) + "\\b";
            lowerText = lowerText.replaceAll(pattern, " ");
        }
        
        // Step 3: Clean up multiple spaces
        normalized = MULTIPLE_SPACES.matcher(lowerText).replaceAll(" ");
        
        // Step 4: Trim leading/trailing spaces
        normalized = normalized.trim();
        
        // Step 5: Capitalize first letter
        if (!normalized.isEmpty()) {
            normalized = normalized.substring(0, 1).toUpperCase() + 
                        normalized.substring(1);
        }
        
        return normalized;
    }
    
    /**
     * Validate if text is meaningful enough for review generation
     */
    public boolean isValidForReview(String text) {
        if (text == null || text.trim().isEmpty()) {
            return false;
        }
        
        // Must have at least 3 words
        String[] words = text.trim().split("\\s+");
        return words.length >= 3;
    }
    
    /**
     * Get word count
     */
    public int getWordCount(String text) {
        if (text == null || text.trim().isEmpty()) {
            return 0;
        }
        return text.trim().split("\\s+").length;
    }
}
