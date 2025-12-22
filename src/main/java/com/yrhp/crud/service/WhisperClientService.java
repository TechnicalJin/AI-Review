package com.yrhp.crud.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.yrhp.crud.config.WhisperConfig;
import com.yrhp.crud.dto.WhisperTranscriptionResponse;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;

@Service
public class WhisperClientService {
    
    private static final Logger logger = LoggerFactory.getLogger(WhisperClientService.class);
    
    @Autowired
    private WhisperConfig whisperConfig;
    
    @Autowired
    @Qualifier("whisperRestTemplate")
    private RestTemplate restTemplate;
    
    /**
     * Transcribe audio file using Whisper service
     */
    public WhisperTranscriptionResponse transcribe(MultipartFile audioFile, String language) {
        
        if (!whisperConfig.getService().isEnabled()) {
            logger.error("Whisper service is disabled");
            WhisperTranscriptionResponse response = new WhisperTranscriptionResponse();
            response.setSuccess(false);
            response.setError("Voice feature is currently disabled");
            return response;
        }
        
        File tempFile = null;
        
        try {
            // Validate file
            validateAudioFile(audioFile);
            
            // Save to temp file
            tempFile = saveToTempFile(audioFile);
            logger.info("Saved audio to temp file: {}", tempFile.getAbsolutePath());
            
            // Prepare request
            String url = whisperConfig.getService().getUrl() + 
                        whisperConfig.getService().getTranscribeEndpoint();
            
            // Create multipart request
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("audio", new FileSystemResource(tempFile));
            
            if (language != null && !language.equalsIgnoreCase("auto")) {
                body.add("language", language);
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            HttpEntity<MultiValueMap<String, Object>> requestEntity = 
                new HttpEntity<>(body, headers);
            
            // Make request
            logger.info("Calling Whisper service: {}", url);
            ResponseEntity<WhisperTranscriptionResponse> responseEntity = 
                restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    WhisperTranscriptionResponse.class
                );
            
            WhisperTranscriptionResponse response = responseEntity.getBody();
            
            if (response != null && response.isSuccess()) {
                logger.info("Transcription successful. Language: {}, Text length: {}", 
                           response.getLanguage(), 
                           response.getText() != null ? response.getText().length() : 0);
            } else {
                logger.error("Transcription failed: {}", 
                            response != null ? response.getError() : "Unknown error");
            }
            
            return response;
            
        } catch (Exception e) {
            logger.error("Error during transcription", e);
            WhisperTranscriptionResponse response = new WhisperTranscriptionResponse();
            response.setSuccess(false);
            response.setError("Transcription failed: " + e.getMessage());
            return response;
            
        } finally {
            // Cleanup temp file
            if (tempFile != null && tempFile.exists()) {
                try {
                    Files.delete(tempFile.toPath());
                    logger.debug("Deleted temp file: {}", tempFile.getAbsolutePath());
                } catch (IOException e) {
                    logger.warn("Failed to delete temp file: {}", tempFile.getAbsolutePath());
                }
            }
        }
    }
    
    /**
     * Check if Whisper service is healthy
     */
    public boolean isServiceHealthy() {
        try {
            String url = whisperConfig.getService().getUrl() + 
                        whisperConfig.getService().getHealthEndpoint();
            
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getStatusCode() == HttpStatus.OK;
            
        } catch (Exception e) {
            logger.error("Whisper service health check failed", e);
            return false;
        }
    }
    
    /**
     * Validate audio file
     */
    private void validateAudioFile(MultipartFile file) throws IOException {
        // Check if file is empty
        if (file.isEmpty()) {
            throw new IOException("Audio file is empty");
        }
        
        // Check file size
        if (file.getSize() > whisperConfig.getMaxFileSize()) {
            throw new IOException("File size exceeds maximum allowed size");
        }
        
        // Check file extension
        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new IOException("Invalid filename");
        }
        
        String extension = getFileExtension(filename);
        if (!isAllowedFormat(extension)) {
            throw new IOException("Invalid file format. Allowed: " + 
                                Arrays.toString(whisperConfig.getAllowedFormats()));
        }
    }
    
    /**
     * Save multipart file to temp directory
     */
    private File saveToTempFile(MultipartFile file) throws IOException {
        // Ensure temp directory exists
        String tempDir = whisperConfig.getTempDirectory();
        Path tempDirPath = Path.of(tempDir);
        Files.createDirectories(tempDirPath);
        
        // Create temp file
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        
        Path tempFilePath = Files.createTempFile(
            tempDirPath, 
            "audio_", 
            "." + extension
        );
        
        // Copy content
        Files.copy(file.getInputStream(), tempFilePath, StandardCopyOption.REPLACE_EXISTING);
        
        return tempFilePath.toFile();
    }
    
    /**
     * Get file extension
     */
    private String getFileExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        if (lastDot > 0) {
            return filename.substring(lastDot + 1).toLowerCase();
        }
        return "";
    }
    
    /**
     * Check if format is allowed
     */
    private boolean isAllowedFormat(String extension) {
        return Arrays.asList(whisperConfig.getAllowedFormats())
                    .contains(extension.toLowerCase());
    }
}