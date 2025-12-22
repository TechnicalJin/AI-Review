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
        
        // Update review textarea (using the correct ID from view.html)
        const reviewTextarea = document.getElementById('review-msg-content');
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
    // Get client name from page data attribute
    const clientElement = document.getElementById('clientNameData') || document.querySelector('[data-client-name]');
    const clientName = clientElement ? clientElement.getAttribute('data-client-name') : 'default';
    
    // Initialize recorder
    window.voiceRecorder = new VoiceReviewRecorder(clientName);
});