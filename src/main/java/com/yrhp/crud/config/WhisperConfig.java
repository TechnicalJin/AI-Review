package com.yrhp.crud.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
@ConfigurationProperties(prefix = "whisper")
public class WhisperConfig {
    
    private Service service = new Service();
    private int maxFileSize = 25 * 1024 * 1024; // 25MB
    private String[] allowedFormats = {"webm", "wav", "mp3", "m4a", "ogg"};
    private String tempDirectory = System.getProperty("java.io.tmpdir") + "/yrhp-audio";
    
    @Bean(name = "whisperRestTemplate")
    public RestTemplate whisperRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(service.getConnectionTimeout());
        factory.setReadTimeout(service.getReadTimeout());
        return new RestTemplate(factory);
    }
    
    // Getters and Setters
    public Service getService() {
        return service;
    }
    
    public void setService(Service service) {
        this.service = service;
    }
    
    public int getMaxFileSize() {
        return maxFileSize;
    }
    
    public void setMaxFileSize(int maxFileSize) {
        this.maxFileSize = maxFileSize;
    }
    
    public String[] getAllowedFormats() {
        return allowedFormats;
    }
    
    public void setAllowedFormats(String[] allowedFormats) {
        this.allowedFormats = allowedFormats;
    }
    
    public String getTempDirectory() {
        return tempDirectory;
    }
    
    public void setTempDirectory(String tempDirectory) {
        this.tempDirectory = tempDirectory;
    }
    
    public static class Service {
        private String url = "http://localhost:5000";
        private boolean enabled = true;
        private String transcribeEndpoint = "/transcribe";
        private String healthEndpoint = "/health";
        private int connectionTimeout = 30000;
        private int readTimeout = 60000;
        
        // Getters and Setters
        public String getUrl() {
            return url;
        }
        
        public void setUrl(String url) {
            this.url = url;
        }
        
        public boolean isEnabled() {
            return enabled;
        }
        
        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }
        
        public String getTranscribeEndpoint() {
            return transcribeEndpoint;
        }
        
        public void setTranscribeEndpoint(String transcribeEndpoint) {
            this.transcribeEndpoint = transcribeEndpoint;
        }
        
        public String getHealthEndpoint() {
            return healthEndpoint;
        }
        
        public void setHealthEndpoint(String healthEndpoint) {
            this.healthEndpoint = healthEndpoint;
        }
        
        public int getConnectionTimeout() {
            return connectionTimeout;
        }
        
        public void setConnectionTimeout(int connectionTimeout) {
            this.connectionTimeout = connectionTimeout;
        }
        
        public int getReadTimeout() {
            return readTimeout;
        }
        
        public void setReadTimeout(int readTimeout) {
            this.readTimeout = readTimeout;
        }
    }
}