# 🎤 Voice-to-Text Feature - Development Implementation Guide
## YRHP Review Generator - Developer's Roadmap
### ✅ Local Development → Testing → Production Ready

---

## 🎯 OVERVIEW

**What You're Building:**
- Add voice recording capability to existing YRHP Review Generator
- Integrate Faster-Whisper BASE model (Python microservice)
- Keep all existing functionality intact
- Test locally before production deployment

**Architecture:**
```
Existing Java Spring Boot App
    ↓ (new) HTTP calls
Python Whisper Service (separate process)
    ↓ (existing) continues normal flow
ChatGPT → Database → UI
```

---

## 📋 PREREQUISITES CHECKLIST

Before starting, ensure you have:

- [ ] Java 11+ installed
- [ ] Maven installed
- [ ] Your existing YRHP project running successfully
- [ ] Python 3.10+ installed
- [ ] pip installed
- [ ] Port 5000 available (for Whisper service)
- [ ] Port 8080 available (for Spring Boot)
- [ ] MySQL running with your database
- [ ] OpenAI API key configured

---

## 🗂️ PROJECT STRUCTURE (What You'll Add)

```
your-yrhp-project/
│
├── src/main/java/com/yrhp/
│   ├── controller/
│   │   └── UserController.java (MODIFY - add voice endpoint)
│   │
│   ├── service/
│   │   ├── ReviewGeneratorService.java (MODIFY - add voice method)
│   │   ├── WhisperClientService.java (NEW)
│   │   └── TextNormalizationService.java (NEW)
│   │
│   ├── dto/
│   │   ├── VoiceReviewRequest.java (NEW)
│   │   └── VoiceReviewResponse.java (NEW)
│   │
│   └── config/
│       └── WhisperConfig.java (NEW)
│
├── src/main/resources/
│   ├── application.properties (MODIFY - add whisper config)
│   └── db/migration/
│       └── V2__add_voice_feature.sql (NEW)
│
├── src/main/resources/static/
│   ├── css/
│   │   └── voice-review.css (NEW)
│   │
│   └── js/
│       └── voiceReview.js (NEW)
│
├── src/main/resources/templates/
│   └── user/
│       └── view.html (MODIFY - add voice UI)
│
└── whisper-service/ (NEW - separate Python project)
    ├── whisper_server.py
    ├── requirements.txt
    ├── run.sh
    └── test_whisper.py
```

---

## 🚀 PHASE 1: SETUP PYTHON WHISPER SERVICE (30 minutes)

### Step 1.1: Create Whisper Service Directory

```bash
# Navigate to your project root
cd /path/to/your-yrhp-project

# Create whisper service directory
mkdir whisper-service
cd whisper-service
```

---

### Step 1.2: Create Python Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate it
# On Linux/Mac:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Verify activation (you should see (venv) in prompt)
which python
```

---

### Step 1.3: Create requirements.txt

Create file: `whisper-service/requirements.txt`

```txt
flask==3.0.0
flask-cors==4.0.0
faster-whisper==0.10.0
python-multipart==0.0.6
```

---

### Step 1.4: Install Dependencies

```bash
# Make sure venv is activated
pip install --upgrade pip
pip install -r requirements.txt

# This will take 5-10 minutes
# It will auto-download the BASE model on first run
```

---

### Step 1.5: Create Whisper Server

Create file: `whisper-service/whisper_server.py`

```python
#!/usr/bin/env python3
"""
Faster-Whisper BASE Model REST API Service
For YRHP Review Generator
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from faster_whisper import WhisperModel
import os
import tempfile
import logging
from werkzeug.utils import secure_filename

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from your Java app

# Allowed audio formats
ALLOWED_EXTENSIONS = {'webm', 'wav', 'mp3', 'm4a', 'ogg'}

# Load BASE model once at startup (this takes 10-20 seconds)
logger.info("🔄 Loading Faster-Whisper BASE model...")
try:
    model = WhisperModel(
        "base",
        device="cpu",
        compute_type="int8",
        download_root=None  # Uses cache directory
    )
    logger.info("✅ BASE model loaded successfully!")
except Exception as e:
    logger.error(f"❌ Failed to load model: {e}")
    raise

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model': 'base',
        'service': 'whisper-service',
        'version': '1.0.0'
    }), 200

@app.route('/transcribe', methods=['POST'])
def transcribe():
    """
    Transcribe audio file to text
    
    Expected form data:
    - audio: audio file (required)
    - language: language code (optional, auto-detect if not provided)
    
    Returns JSON:
    {
        "success": true,
        "text": "transcribed text",
        "language": "detected language",
        "language_probability": 0.95,
        "duration": 10.5
    }
    """
    try:
        # Validate request
        if 'audio' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No audio file provided'
            }), 400
        
        audio_file = request.files['audio']
        
        # Check if file is selected
        if audio_file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        # Validate file extension
        if not allowed_file(audio_file.filename):
            return jsonify({
                'success': False,
                'error': f'Invalid file type. Allowed: {ALLOWED_EXTENSIONS}'
            }), 400
        
        # Get optional language parameter
        language = request.form.get('language', None)
        if language and language.lower() == 'auto':
            language = None
        
        logger.info(f"📝 Processing file: {audio_file.filename}")
        
        # Save to temporary file
        filename = secure_filename(audio_file.filename)
        temp_fd, temp_path = tempfile.mkstemp(suffix=os.path.splitext(filename)[1])
        
        try:
            # Write audio data
            with os.fdopen(temp_fd, 'wb') as f:
                audio_file.save(f)
            
            logger.info(f"🎤 Transcribing with language: {language or 'auto-detect'}")
            
            # Transcribe using BASE model
            segments, info = model.transcribe(
                temp_path,
                language=language,
                vad_filter=True,  # Voice Activity Detection
                vad_parameters=dict(
                    threshold=0.5,
                    min_speech_duration_ms=250
                )
            )
            
            # Collect all segments
            text_segments = []
            for segment in segments:
                text_segments.append(segment.text.strip())
            
            # Join segments
            final_text = " ".join(text_segments).strip()
            
            logger.info(f"✅ Transcription complete: {len(final_text)} chars")
            
            # Prepare response
            response = {
                'success': True,
                'text': final_text,
                'language': info.language,
                'language_probability': round(info.language_probability, 4),
                'duration': round(info.duration, 2) if hasattr(info, 'duration') else 0
            }
            
            return jsonify(response), 200
            
        finally:
            # Always cleanup temp file
            try:
                os.unlink(temp_path)
            except:
                pass
    
    except Exception as e:
        logger.error(f"❌ Transcription error: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Transcription failed: {str(e)}'
        }), 500

@app.route('/models', methods=['GET'])
def list_models():
    """List available models"""
    return jsonify({
        'current_model': 'base',
        'available_models': ['tiny', 'base', 'small', 'medium', 'large'],
        'recommended': 'base'
    }), 200

if __name__ == '__main__':
    logger.info("🚀 Starting Whisper Service on http://localhost:5000")
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True  # Set to False in production
    )
```

---

### Step 1.6: Create Run Script

Create file: `whisper-service/run.sh`

```bash
#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Start Whisper service
echo "🚀 Starting Whisper Service..."
python whisper_server.py
```

Make it executable:
```bash
chmod +x run.sh
```

---

### Step 1.7: Create Test Script

Create file: `whisper-service/test_whisper.py`

```python
#!/usr/bin/env python3
"""
Test script for Whisper service
"""

import requests
import sys

def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get('http://localhost:5000/health')
        if response.status_code == 200:
            print("✅ Health check passed:", response.json())
            return True
        else:
            print("❌ Health check failed:", response.status_code)
            return False
    except Exception as e:
        print("❌ Could not connect to service:", e)
        return False

def test_transcription(audio_file_path):
    """Test transcription with actual audio file"""
    print(f"\nTesting transcription with: {audio_file_path}")
    try:
        with open(audio_file_path, 'rb') as f:
            files = {'audio': f}
            response = requests.post('http://localhost:5000/transcribe', files=files)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Transcription successful!")
            print(f"Text: {result['text']}")
            print(f"Language: {result['language']} ({result['language_probability']*100:.1f}%)")
            print(f"Duration: {result['duration']}s")
            return True
        else:
            print("❌ Transcription failed:", response.json())
            return False
    except Exception as e:
        print("❌ Error during transcription:", e)
        return False

if __name__ == '__main__':
    print("🧪 Whisper Service Test Suite\n")
    
    # Test 1: Health
    if not test_health():
        print("\n⚠️  Service is not running. Start it with: ./run.sh")
        sys.exit(1)
    
    # Test 2: Transcription (if audio file provided)
    if len(sys.argv) > 1:
        audio_file = sys.argv[1]
        test_transcription(audio_file)
    else:
        print("\n💡 To test transcription, run:")
        print("   python test_whisper.py <path-to-audio-file.webm>")
    
    print("\n✅ All tests completed!")
```

Make it executable:
```bash
chmod +x test_whisper.py
```

---

### Step 1.8: Start Whisper Service

```bash
# In whisper-service directory
./run.sh

# You should see:
# 🔄 Loading Faster-Whisper BASE model...
# ✅ BASE model loaded successfully!
# 🚀 Starting Whisper Service on http://localhost:5000
```

**⚠️ Important:** Keep this terminal open. The service must be running.

---

### Step 1.9: Test Whisper Service

Open a **new terminal**:

```bash
cd whisper-service
source venv/bin/activate
python test_whisper.py

# Expected output:
# 🧪 Whisper Service Test Suite
# Testing health endpoint...
# ✅ Health check passed: {'status': 'healthy', 'model': 'base', ...}
```

**✅ CHECKPOINT:** If health check passes, Python service is ready!

---

## 🔧 PHASE 2: JAVA BACKEND INTEGRATION (2-3 hours)

### Step 2.1: Update application.properties

Add to: `src/main/resources/application.properties`

```properties
# ============================================
# Whisper Service Configuration
# ============================================
whisper.service.url=http://localhost:5000
whisper.service.enabled=true
whisper.transcribe.endpoint=/transcribe
whisper.health.endpoint=/health
whisper.connection.timeout=30000
whisper.read.timeout=60000

# Audio Upload Configuration
whisper.max.file.size=25MB
whisper.allowed.formats=webm,wav,mp3,m4a,ogg
whisper.temp.directory=${java.io.tmpdir}/yrhp-audio

# Voice Feature Toggle
feature.voice.enabled=true
```

---

### Step 2.2: Create WhisperConfig.java

Create file: `src/main/java/com/yrhp/config/WhisperConfig.java`

```java
package com.yrhp.config;

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
```

---

### Step 2.3: Create DTOs

**File 1:** `src/main/java/com/yrhp/dto/VoiceReviewRequest.java`

```java
package com.yrhp.dto;

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
```

---

**File 2:** `src/main/java/com/yrhp/dto/VoiceReviewResponse.java`

```java
package com.yrhp.dto;

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
```

---

**File 3:** `src/main/java/com/yrhp/dto/WhisperTranscriptionResponse.java`

```java
package com.yrhp.dto;

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
```

---

### Step 2.4: Create TextNormalizationService.java

Create file: `src/main/java/com/yrhp/service/TextNormalizationService.java`

```java
package com.yrhp.service;

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
```

---

### Step 2.5: Create WhisperClientService.java

Create file: `src/main/java/com/yrhp/service/WhisperClientService.java`

```java
package com.yrhp.service;

import com.yrhp.config.WhisperConfig;
import com.yrhp.dto.WhisperTranscriptionResponse;
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
```

---

### Step 2.6: Update ReviewGeneratorService.java

Add this method to your existing `ReviewGeneratorService.java`:

```java
/**
 * Generate review from voice recording
 */
public VoiceReviewResponse generateReviewFromVoice(
        String clientName,
        MultipartFile audioFile,
        String language) {
    
    try {
        logger.info("Generating review from voice for client: {}", clientName);
        
        // Step 1: Transcribe audio
        WhisperTranscriptionResponse transcription = 
            whisperClientService.transcribe(audioFile, language);
        
        if (!transcription.isSuccess()) {
            return new VoiceReviewResponse("Transcription failed: " + transcription.getError());
        }
        
        String rawText = transcription.getText();
        logger.info("Raw transcription: {}", rawText);
        
        // Step 2: Normalize text
        String normalizedText = textNormalizationService.normalizeText(rawText);
        logger.info("Normalized text: {}", normalizedText);
        
        // Step 3: Validate text
        if (!textNormalizationService.isValidForReview(normalizedText)) {
            return new VoiceReviewResponse(
                "Audio is too short or unclear. Please speak more clearly."
            );
        }
        
        // Step 4: Generate review using existing ChatGPT logic
        ReviewRequest reviewRequest = new ReviewRequest();
        reviewRequest.setUserInput(normalizedText);
        reviewRequest.setPreferredLanguage(transcription.getLanguage());
        reviewRequest.setTone("professional");
        
        ReviewResponse reviewResponse = generateReview(clientName, reviewRequest);
        
        if (reviewResponse.isSuccess()) {
            // Step 5: Create response
            return new VoiceReviewResponse(
                reviewResponse.getReview(),
                normalizedText,
                transcription.getLanguage(),
                transcription.getLanguageProbability(),
                transcription.getDuration()
            );
        } else {
            return new VoiceReviewResponse("Failed to generate review");
        }
        
    } catch (Exception e) {
        logger.error("Error generating review from voice", e);
        return new VoiceReviewResponse("An error occurred: " + e.getMessage());
    }
}
```

**Don't forget to add these dependencies at the top:**

```java
@Autowired
private WhisperClientService whisperClientService;

@Autowired
private TextNormalizationService textNormalizationService;
```

---

### Step 2.7: Update UserController.java

Add this endpoint to your existing `UserController.java`:

```java
/**
 * Generate review from voice recording
 */
@PostMapping("/generate-review-from-voice/{clientName}")
public ResponseEntity<VoiceReviewResponse> generateReviewFromVoice(
        @PathVariable String clientName,
        @RequestParam("audio") MultipartFile audioFile,
        @RequestParam(value = "language", required = false, defaultValue = "auto") String language) {
    
    try {
        logger.info("Received voice review request for client: {}", clientName);
        
        // Check if voice feature is enabled
        if (!isVoiceFeatureEnabled()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new VoiceReviewResponse("Voice feature is currently disabled"));
        }
        
        // Generate review
        VoiceReviewResponse response = reviewGeneratorService.generateReviewFromVoice(
            clientName, 
            audioFile, 
            language
        );
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
        
    } catch (Exception e) {
        logger.error("Error processing voice review", e);
        return ResponseEntity.internalServerError()
            .body(new VoiceReviewResponse("Server error: " + e.getMessage()));
    }
}

/**
 * Check if voice feature is enabled
 */
private boolean isVoiceFeatureEnabled() {
    // Check from application.properties
    return environment.getProperty("feature.voice.enabled", Boolean.class, false) &&
           whisperClientService.isServiceHealthy();
}

/**
 * Health check for voice feature
 */
@GetMapping("/voice-health")
@ResponseBody
public ResponseEntity<Map<String, Object>> checkVoiceHealth() {
    Map<String, Object> health = new HashMap<>();
    
    boolean featureEnabled = environment.getProperty("feature.voice.enabled", Boolean.class, false);
    boolean serviceHealthy = whisperClientService.isServiceHealthy();
    
    health.put("featureEnabled", featureEnabled);
    health.put("serviceHealthy", serviceHealthy);
    health.put("status", (featureEnabled && serviceHealthy) ? "available" : "unavailable");
    
    return ResponseEntity.ok(health);
}
```

**Add these dependencies:**

```java
@Autowired
private Environment environment;

@Autowired
private WhisperClientService whisperClientService;
```

---

### Step 2.8: Update Database Schema

Create file: `src/main/resources/db/migration/V2__add_voice_feature.sql`

```sql
-- Add voice feature columns to review_generation_log table

ALTER TABLE review_generation_log
ADD COLUMN is_voice_generated BOOLEAN DEFAULT FALSE AFTER review_length,
ADD COLUMN voice_transcription TEXT AFTER is_voice_generated,
ADD COLUMN detected_language VARCHAR(10) AFTER voice_transcription,
ADD COLUMN language_confidence DECIMAL(5,4) AFTER detected_language,
ADD COLUMN audio_duration DECIMAL(6,2) AFTER language_confidence;

-- Add index for voice queries
CREATE INDEX idx_is_voice_generated ON review_generation_log(is_voice_generated);

-- Add comment
ALTER TABLE review_generation_log 
COMMENT = 'Stores all generated reviews including text and voice-based generations';
```

**Run migration:**

```bash
# If using Flyway (automatically runs on startup)
# OR manually:
mysql -u your_username -p your_database < src/main/resources/db/migration/V2__add_voice_feature.sql
```

---

### Step 2.9: Test Java Backend

```bash
# Rebuild project
./mvnw clean package

# Start Spring Boot
./mvnw spring-boot:run

# In another terminal, test health endpoint
curl http://localhost:8080/user/voice-health

# Expected output:
# {"featureEnabled":true,"serviceHealthy":true,"status":"available"}
```

**✅ CHECKPOINT:** If voice-health returns "available", backend is ready!

---

## 🎨 PHASE 3: FRONTEND INTEGRATION (2-3 hours)

### Step 3.1: Create CSS File

Create file: `src/main/resources/static/css/voice-review.css`

```css
/**
 * Voice Review Feature Styles
 * YRHP Review Generator
 */

/* Voice Input Container */
.voice-input-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    padding: 30px;
    margin: 20px 0;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    color: white;
}

.voice-input-container h3 {
    margin-top: 0;
    font-size: 24px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
}

.voice-input-container h3 i {
    font-size: 28px;
}

/* Voice Controls */
.voice-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    margin: 30px 0;
}

/* Record Button */
.record-button {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: none;
    background: white;
    color: #667eea;
    font-size: 48px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
    position: relative;
    overflow: hidden;
}

.record-button:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

.record-button:active {
    transform: scale(0.95);
}

.record-button.recording {
    background: #ef4444;
    color: white;
    animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% {
        box-shadow: 0 5px 20px rgba(239, 68, 68, 0.4);
    }
    50% {
        box-shadow: 0 5px 30px rgba(239, 68, 68, 0.8);
    }
}

.record-button.processing {
    background: #fbbf24;
    color: white;
    cursor: not-allowed;
}

.record-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Status Text */
.voice-status {
    font-size: 18px;
    font-weight: 500;
    text-align: center;
    min-height: 30px;
}

.voice-status.recording {
    color: #fef3c7;
    animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
}

/* Timer */
.voice-timer {
    font-size: 32px;
    font-weight: 600;
    font-family: 'Courier New', monospace;
    text-align: center;
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

/* Language Selection */
.language-selection {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
}

.language-btn {
    padding: 10px 20px;
    border: 2px solid white;
    background: transparent;
    color: white;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
}

.language-btn:hover {
    background: white;
    color: #667eea;
}

.language-btn.active {
    background: white;
    color: #667eea;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

/* Audio Preview */
.audio-preview {
    margin: 20px 0;
    text-align: center;
}

.audio-preview audio {
    width: 100%;
    max-width: 400px;
    border-radius: 10px;
}

/* Transcription Display */
.transcription-display {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 20px;
    margin: 20px 0;
    backdrop-filter: blur(10px);
}

.transcription-display h4 {
    margin-top: 0;
    font-size: 16px;
    opacity: 0.9;
}

.transcription-text {
    font-size: 18px;
    line-height: 1.6;
    font-style: italic;
}

.transcription-meta {
    display: flex;
    justify-content: space-between;
    margin-top: 15px;
    font-size: 14px;
    opacity: 0.8;
}

/* Loading Animation */
.loading-animation {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin: 20px 0;
}

.loading-dot {
    width: 12px;
    height: 12px;
    background: white;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out;
}

.loading-dot:nth-child(1) {
    animation-delay: -0.32s;
}

.loading-dot:nth-child(2) {
    animation-delay: -0.16s;
}

@keyframes bounce {
    0%, 80%, 100% {
        transform: scale(0);
        opacity: 0.5;
    }
    40% {
        transform: scale(1);
        opacity: 1;
    }
}

/* Error Message */
.voice-error {
    background: rgba(239, 68, 68, 0.2);
    border: 2px solid rgba(239, 68, 68, 0.5);
    border-radius: 10px;
    padding: 15px;
    margin: 20px 0;
    text-align: center;
}

/* Tips Section */
.voice-tips {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 20px;
    margin: 20px 0;
    backdrop-filter: blur(10px);
}

.voice-tips h4 {
    margin-top: 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.voice-tips ul {
    margin: 10px 0;
    padding-left: 25px;
}

.voice-tips li {
    margin: 8px 0;
    line-height: 1.5;
}

/* Responsive Design */
@media (max-width: 768px) {
    .voice-input-container {
        padding: 20px;
    }
    
    .record-button {
        width: 100px;
        height: 100px;
        font-size: 40px;
    }
    
    .voice-timer {
        font-size: 28px;
    }
    
    .language-selection {
        flex-direction: column;
        align-items: stretch;
    }
    
    .language-btn {
        width: 100%;
    }
}

/* Accessibility */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}

/* Print Styles */
@media print {
    .voice-input-container {
        display: none;
    }
}
```

---

### Step 3.2: Create JavaScript File

Create file: `src/main/resources/static/js/voiceReview.js`

```javascript
/**
 * Voice Review Feature - JavaScript
 * YRHP Review Generator
 */

class VoiceReviewRecorder {
    constructor(clientName) {
        this.clientName = clientName;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.audioBlob = null;
        this.audioUrl = null;
        this.startTime = null;
        this.timerInterval = null;
        this.selectedLanguage = 'auto';
        
        this.init();
    }
    
    init() {
        // Check browser support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.showError('Your browser does not support audio recording. Please use Chrome, Firefox, or Safari.');
            return;
        }
        
        // Initialize event listeners
        this.setupEventListeners();
        
        // Check service health
        this.checkServiceHealth();
    }
    
    setupEventListeners() {
        // Record button
        const recordBtn = document.getElementById('recordButton');
        if (recordBtn) {
            recordBtn.addEventListener('click', () => this.toggleRecording());
        }
        
        // Language buttons
        const languageBtns = document.querySelectorAll('.language-btn');
        languageBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.selectLanguage(e.target.dataset.lang));
        });
    }
    
    async checkServiceHealth() {
        try {
            const response = await fetch('/user/voice-health');
            const health = await response.json();
            
            if (health.status !== 'available') {
                this.showError('Voice feature is currently unavailable. Please try again later.');
                document.getElementById('recordButton').disabled = true;
            }
        } catch (error) {
            console.error('Health check failed:', error);
        }
    }
    
    selectLanguage(lang) {
        this.selectedLanguage = lang;
        
        // Update UI
        document.querySelectorAll('.language-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-lang="${lang}"]`).classList.add('active');
    }
    
    async toggleRecording() {
        if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
            await this.startRecording();
        } else {
            this.stopRecording();
        }
    }
    
    async startRecording() {
        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });
            
            // Create MediaRecorder
            const options = { mimeType: 'audio/webm' };
            this.mediaRecorder = new MediaRecorder(stream, options);
            this.audioChunks = [];
            
            // Setup event handlers
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                this.handleRecordingStop();
            };
            
            // Start recording
            this.mediaRecorder.start();
            this.startTime = Date.now();
            this.startTimer();
            
            // Update UI
            this.updateUIState('recording');
            
        } catch (error) {
            console.error('Error starting recording:', error);
            if (error.name === 'NotAllowedError') {
                this.showError('Microphone access denied. Please allow microphone access and try again.');
            } else {
                this.showError('Failed to start recording: ' + error.message);
            }
        }
    }
    
    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            this.stopTimer();
        }
    }
    
    handleRecordingStop() {
        // Create audio blob
        this.audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.audioUrl = URL.createObjectURL(this.audioBlob);
        
        // Show audio preview
        this.showAudioPreview();
        
        // Process recording
        this.processRecording();
    }
    
    showAudioPreview() {
        const previewContainer = document.getElementById('audioPreview');
        if (previewContainer) {
            previewContainer.innerHTML = `
                <audio controls src="${this.audioUrl}"></audio>
            `;
            previewContainer.style.display = 'block';
        }
    }
    
    async processRecording() {
        try {
            // Update UI
            this.updateUIState('processing');
            this.showStatus('Processing your voice...');
            
            // Prepare form data
            const formData = new FormData();
            formData.append('audio', this.audioBlob, 'recording.webm');
            formData.append('language', this.selectedLanguage);
            
            // Send to server
            const response = await fetch(`/user/generate-review-from-voice/${this.clientName}`, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.handleSuccess(result);
            } else {
                this.showError(result.error || 'Failed to generate review');
                this.updateUIState('idle');
            }
            
        } catch (error) {
            console.error('Error processing recording:', error);
            this.showError('Failed to process recording: ' + error.message);
            this.updateUIState('idle');
        }
    }
    
    handleSuccess(result) {
        // Show transcription
        this.showTranscription(result);
        
        // Update review textarea (assuming it exists)
        const reviewTextarea = document.getElementById('generatedReview');
        if (reviewTextarea) {
            reviewTextarea.value = result.review;
        }
        
        // Show success message
        this.showStatus('✅ Review generated successfully!');
        
        // Reset UI
        setTimeout(() => {
            this.updateUIState('idle');
        }, 2000);
    }
    
    showTranscription(result) {
        const container = document.getElementById('transcriptionDisplay');
        if (container) {
            const languageName = this.getLanguageName(result.detectedLanguage);
            const confidence = (result.languageConfidence * 100).toFixed(1);
            
            container.innerHTML = `
                <h4>📝 What you said:</h4>
                <div class="transcription-text">"${result.transcription}"</div>
                <div class="transcription-meta">
                    <span>🌐 Language: ${languageName}</span>
                    <span>🎯 Confidence: ${confidence}%</span>
                    <span>⏱️ Duration: ${result.audioDuration.toFixed(1)}s</span>
                </div>
            `;
            container.style.display = 'block';
        }
    }
    
    getLanguageName(code) {
        const languages = {
            'en': 'English',
            'hi': 'Hindi',
            'gu': 'Gujarati',
            'mr': 'Marathi',
            'ta': 'Tamil',
            'te': 'Telugu'
        };
        return languages[code] || code.toUpperCase();
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const seconds = Math.floor(elapsed / 1000);
            const minutes = Math.floor(seconds / 60);
            const displaySeconds = seconds % 60;
            
            const timerElement = document.getElementById('voiceTimer');
            if (timerElement) {
                timerElement.textContent = 
                    `${minutes}:${displaySeconds.toString().padStart(2, '0')}`;
            }
            
            // Auto-stop after 60 seconds
            if (seconds >= 60) {
                this.stopRecording();
                this.showStatus('⚠️ Maximum recording time reached');
            }
        }, 100);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateUIState(state) {
        const recordBtn = document.getElementById('recordButton');
        const statusElement = document.getElementById('voiceStatus');
        const timerElement = document.getElementById('voiceTimer');
        
        // Reset classes
        recordBtn.className = 'record-button';
        if (statusElement) statusElement.className = 'voice-status';
        
        switch (state) {
            case 'idle':
                recordBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                recordBtn.disabled = false;
                if (statusElement) statusElement.textContent = 'Tap to start recording';
                if (timerElement) timerElement.textContent = '0:00';
                break;
                
            case 'recording':
                recordBtn.classList.add('recording');
                recordBtn.innerHTML = '<i class="fas fa-stop"></i>';
                if (statusElement) {
                    statusElement.classList.add('recording');
                    statusElement.textContent = '🔴 Recording... Tap to stop';
                }
                break;
                
            case 'processing':
                recordBtn.classList.add('processing');
                recordBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                recordBtn.disabled = true;
                if (statusElement) statusElement.textContent = 'Processing...';
                this.showLoadingAnimation();
                break;
        }
    }
    
    showLoadingAnimation() {
        const container = document.getElementById('transcriptionDisplay');
        if (container) {
            container.innerHTML = `
                <div class="loading-animation">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                </div>
                <p style="text-align: center; margin-top: 10px;">
                    Transcribing your voice...
                </p>
            `;
            container.style.display = 'block';
        }
    }
    
    showStatus(message) {
        const statusElement = document.getElementById('voiceStatus');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }
    
    showError(message) {
        const container = document.getElementById('voiceError');
        if (container) {
            container.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                ${message}
            `;
            container.style.display = 'block';
            
            // Hide after 5 seconds
            setTimeout(() => {
                container.style.display = 'none';
            }, 5000);
        } else {
            alert(message);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Get client name from page (adjust selector as needed)
    const clientElement = document.querySelector('[data-client-name]');
    const clientName = clientElement ? clientElement.dataset.clientName : 'default';
    
    // Initialize recorder
    window.voiceRecorder = new VoiceReviewRecorder(clientName);
});
```

---

### Step 3.3: Update view.html (User Page)

Add this section to your `src/main/resources/templates/user/view.html`:

Find the location where you want to add the voice input (probably after the existing text input section) and add:

```html
<!-- Voice Review Section -->
<div class="voice-input-container" id="voiceInputContainer">
    <h3>
        <i class="fas fa-microphone"></i>
        Voice Review (NEW!)
    </h3>
    
    <p>Speak your review naturally in Hindi, Gujarati, or English. We'll convert it to a perfect Google Review!</p>
    
    <!-- Language Selection -->
    <div class="language-selection">
        <button class="language-btn active" data-lang="auto">
            <i class="fas fa-globe"></i> Auto-Detect
        </button>
        <button class="language-btn" data-lang="hi">
            <i class="fas fa-language"></i> Hindi
        </button>
        <button class="language-btn" data-lang="gu">
            <i class="fas fa-language"></i> Gujarati
        </button>
        <button class="language-btn" data-lang="en">
            <i class="fas fa-language"></i> English
        </button>
    </div>
    
    <!-- Recording Controls -->
    <div class="voice-controls">
        <button id="recordButton" class="record-button" aria-label="Start Recording">
            <i class="fas fa-microphone"></i>
        </button>
        
        <div id="voiceTimer" class="voice-timer">0:00</div>
        
        <div id="voiceStatus" class="voice-status">
            Tap to start recording
        </div>
    </div>
    
    <!-- Audio Preview -->
    <div id="audioPreview" class="audio-preview" style="display: none;">
        <!-- Audio player will be inserted here -->
    </div>
    
    <!-- Transcription Display -->
    <div id="transcriptionDisplay" class="transcription-display" style="display: none;">
        <!-- Transcription will be shown here -->
    </div>
    
    <!-- Error Display -->
    <div id="voiceError" class="voice-error" style="display: none;">
        <!-- Errors will be shown here -->
    </div>
    
    <!-- Tips -->
    <div class="voice-tips">
        <h4><i class="fas fa-lightbulb"></i> Tips for best results:</h4>
        <ul>
            <li>🔇 Find a quiet place</li>
            <li>🗣️ Speak clearly and naturally</li>
            <li>⏱️ Keep it under 60 seconds</li>
            <li>💬 Describe your experience, feelings, and recommendation</li>
        </ul>
    </div>
</div>

<!-- Include required CSS and JS -->
<link rel="stylesheet" href="/css/voice-review.css">
<script src="/js/voiceReview.js"></script>

<!-- Add data attribute for client name -->
<div data-client-name="${clientName}" style="display: none;"></div>
```

**Note:** Adjust the Thymeleaf syntax (`${clientName}`) based on your existing template structure.

---

## ✅ PHASE 4: TESTING (1-2 hours)

### Step 4.1: Create Test Checklist

Create file: `TESTING_CHECKLIST.md`

```markdown
# Voice Feature Testing Checklist

## Backend Tests

### Whisper Service
- [ ] Python service starts without errors
- [ ] Health endpoint returns 200 OK
- [ ] Can transcribe sample audio files
- [ ] Handles different audio formats (webm, wav, mp3)
- [ ] Returns proper error for invalid files

### Java Backend
- [ ] Application starts successfully
- [ ] /user/voice-health endpoint works
- [ ] Can upload audio file
- [ ] Transcription endpoint returns result
- [ ] Review generation works with voice input
- [ ] Database logging works

## Frontend Tests

### UI
- [ ] Voice section displays correctly
- [ ] Language buttons work
- [ ] Record button responds to click
- [ ] Timer starts when recording
- [ ] Audio preview shows after recording
- [ ] Transcription displays correctly
- [ ] Generated review appears in textarea

### Recording
- [ ] Browser requests microphone permission
- [ ] Recording starts on button click
- [ ] Recording stops on button click
- [ ] Auto-stops at 60 seconds
- [ ] Audio quality is acceptable

## Language Tests

### Hindi
- [ ] Clear Hindi audio transcribes correctly
- [ ] Review generates in appropriate language
- [ ] Handles Hindi-English mix

### Gujarati
- [ ] Clear Gujarati audio transcribes correctly
- [ ] Review generates appropriately
- [ ] Handles code-switching

### English
- [ ] English audio transcribes correctly
- [ ] Review generation works

## Error Handling

- [ ] Handles microphone permission denial
- [ ] Handles network errors
- [ ] Handles Whisper service down
- [ ] Handles file too large
- [ ] Handles invalid audio format
- [ ] Handles unclear audio
- [ ] Shows appropriate error messages

## Performance

- [ ] Transcription completes in 1-3 seconds
- [ ] Total flow completes in 3-5 seconds
- [ ] No memory leaks
- [ ] Handles concurrent recordings

## Mobile Tests

- [ ] Works on Chrome mobile
- [ ] Works on Safari mobile
- [ ] UI is responsive
- [ ] Recording works on mobile
- [ ] Upload works on mobile

## Browser Compatibility

- [ ] Chrome desktop
- [ ] Firefox desktop
- [ ] Safari desktop
- [ ] Edge desktop
- [ ] Chrome mobile
- [ ] Safari mobile
```

---

### Step 4.2: Manual Testing Script

Create file: `whisper-service/manual_test.sh`

```bash
#!/bin/bash

echo "🧪 Manual Testing Script for Voice Feature"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check Python service
echo "Test 1: Checking Whisper service..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)
if [ $response -eq 200 ]; then
    echo -e "${GREEN}✅ Whisper service is running${NC}"
else
    echo -e "${RED}❌ Whisper service is not running (HTTP $response)${NC}"
    echo "   Start it with: cd whisper-service && ./run.sh"
    exit 1
fi

# Test 2: Check Java backend
echo ""
echo "Test 2: Checking Spring Boot backend..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/user/voice-health)
if [ $response -eq 200 ]; then
    echo -e "${GREEN}✅ Spring Boot backend is running${NC}"
    health=$(curl -s http://localhost:8080/user/voice-health)
    echo "   Health: $health"
else
    echo -e "${RED}❌ Spring Boot backend is not running (HTTP $response)${NC}"
    echo "   Start it with: ./mvnw spring-boot:run"
    exit 1
fi

# Test 3: Check if test audio exists
echo ""
echo "Test 3: Looking for test audio files..."
if [ -f "test-audio.webm" ]; then
    echo -e "${GREEN}✅ Found test-audio.webm${NC}"
    
    # Test transcription
    echo ""
    echo "Test 4: Testing transcription..."
    curl -X POST http://localhost:5000/transcribe \
         -F "audio=@test-audio.webm" \
         -s | python3 -m json.tool
else
    echo -e "${YELLOW}⚠️  No test audio found${NC}"
    echo "   Create test audio:"
    echo "   1. Open your web app"
    echo "   2. Record a voice review"
    echo "   3. Check browser network tab for audio file"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Testing complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:8080/user/view/{clientName}"
echo "2. Try recording a voice review"
echo "3. Check the generated review"
```

Make executable:
```bash
chmod +x whisper-service/manual_test.sh
```

Run tests:
```bash
cd whisper-service
./manual_test.sh
```

---

### Step 4.3: End-to-End Test

```bash
# Terminal 1: Start Whisper service
cd whisper-service
./run.sh

# Terminal 2: Start Spring Boot
cd ..
./mvnw spring-boot:run

# Terminal 3: Open browser
# Navigate to: http://localhost:8080/user/view/test-client
# 1. Click language (Auto-Detect)
# 2. Click microphone button
# 3. Allow microphone access
# 4. Speak: "This place has great food and excellent service"
# 5. Click stop button
# 6. Wait for review to generate
# 7. Verify review appears in textarea
```

**✅ CHECKPOINT:** If all steps work, feature is ready!

---

## 🐛 PHASE 5: TROUBLESHOOTING GUIDE

### Problem: Whisper service won't start

**Solution:**
```bash
# Check Python version
python3 --version  # Should be 3.10+

# Recreate virtual environment
cd whisper-service
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Check for errors
python whisper_server.py
```

---

### Problem: "Microphone access denied"

**Solution:**
1. Check browser permissions
2. Chrome: chrome://settings/content/microphone
3. Firefox: about:preferences#privacy
4. Allow microphone for localhost
5. Refresh page

---

### Problem: "Service unavailable" error

**Check:**
```bash
# 1. Is Whisper service running?
curl http://localhost:5000/health

# 2. Is Spring Boot running?
curl http://localhost:8080/user/voice-health

# 3. Check logs
# Whisper logs: Check terminal where run.sh is running
# Spring Boot logs: Check application console

# 4. Check ports
netstat -tuln | grep 5000
netstat -tuln | grep 8080
```

---

### Problem: Transcription accuracy is poor

**Solutions:**
1. Ensure quiet environment
2. Speak clearly and slowly
3. Check microphone quality
4. Try specifying language manually
5. Consider upgrading to SMALL model later

---

### Problem: Slow transcription

**Check:**
```bash
# CPU usage
top

# Available RAM
free -h

# If consistently slow, consider:
# 1. Using GPU (if available)
# 2. Upgrading to cloud server
# 3. Adding more RAM
```

---

## 📊 PHASE 6: MONITORING & LOGGING

### Add Logging

Update `application.properties`:

```properties
# Logging Configuration
logging.level.com.yrhp.service.WhisperClientService=DEBUG
logging.level.com.yrhp.service.TextNormalizationService=DEBUG
logging.file.name=logs/yrhp-voice-feature.log
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
```

---

### Monitor Voice Usage

```sql
-- Query voice feature usage
SELECT 
    DATE(generated_at) as date,
    COUNT(*) as total_reviews,
    SUM(CASE WHEN is_voice_generated = TRUE THEN 1 ELSE 0 END) as voice_reviews,
    AVG(CASE WHEN is_voice_generated = TRUE THEN audio_duration ELSE NULL END) as avg_duration,
    detected_language,
    AVG(language_confidence) as avg_confidence
FROM review_generation_log
WHERE generated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(generated_at), detected_language
ORDER BY date DESC;
```

---

## 🚀 PHASE 7: OPTIMIZATION (OPTIONAL)

### Performance Optimization

**1. Add Redis Caching (Optional)**

```properties
# Add to application.properties
spring.cache.type=redis
spring.redis.host=localhost
spring.redis.port=6379
```

**2. Add Request Queue (Optional)**

If you expect high traffic, add a request queue:
```java
@Component
public class VoiceRequestQueue {
    private final Queue<VoiceRequest> queue = new LinkedList<>();
    // Implement queue logic
}
```

---

## ✅ FINAL DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] All tests pass
- [ ] Error handling works
- [ ] Logging is configured
- [ ] Database migration ran successfully
- [ ] Python service runs as systemd service
- [ ] Spring Boot starts without errors
- [ ] Tested on multiple browsers
- [ ] Tested on mobile devices
- [ ] Tested different languages
- [ ] Backup database before deployment
- [ ] Monitor logs for first 24 hours

---

## 📈 SUCCESS METRICS

Track these metrics:

1. **Usage**
   - Voice reviews vs text reviews
   - Daily/weekly voice review count
   - Peak usage times

2. **Performance**
   - Average transcription time
   - Average end-to-end time
   - Error rate

3. **Quality**
   - Language detection accuracy
   - User satisfaction
   - Review approval rate

---

## 🎉 COMPLETION

**Congratulations!** You've successfully integrated voice-to-text into your YRHP Review Generator!

**Timeline Summary:**
- Phase 1 (Python Setup): 30 minutes
- Phase 2 (Java Backend): 2-3 hours
- Phase 3 (Frontend): 2-3 hours
- Phase 4 (Testing): 1-2 hours
- **Total: 6-9 hours**

**What You Built:**
✅ Faster-Whisper BASE model integration
✅ Python microservice for speech-to-text
✅ Java Spring Boot endpoints
✅ Beautiful voice recording UI
✅ Support for Hindi, Gujarati, English
✅ Real-time transcription
✅ Database logging
✅ Error handling
✅ Mobile support

**Next Steps:**
1. Test thoroughly in development
2. Monitor performance
3. Gather user feedback
4. Optimize based on usage patterns
5. Consider upgrade to SMALL model if needed

---

**Document Version:** 1.0  
**Created:** December 22, 2024  
**For:** YRHP Review Generator Development  
**Status:** Ready for Implementation ✅

**Good luck with your implementation! 🚀**

---

## 📞 QUICK REFERENCE

**Start Services:**
```bash
# Terminal 1: Whisper
cd whisper-service && ./run.sh

# Terminal 2: Spring Boot
./mvnw spring-boot:run
```

**Test Endpoints:**
```bash
# Whisper health
curl http://localhost:5000/health

# Java health
curl http://localhost:8080/user/voice-health

# Test transcription
curl -X POST http://localhost:5000/transcribe -F "audio=@test.webm"
```

**View Logs:**
```bash
# Whisper logs: Check terminal
# Spring Boot logs: Check application console
# Or: tail -f logs/yrhp-voice-feature.log
```
