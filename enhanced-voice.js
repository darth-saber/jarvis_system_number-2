// JARVIS Enhanced Voice Recognition System
// Advanced voice processing with noise reduction and confidence scoring

class EnhancedVoiceProcessor {
    constructor() {
        this.isProcessing = false;
        this.noiseReductionEnabled = true;
        this.voiceActivityThreshold = 0.3;
        this.confidenceThreshold = 0.7;
        this.continuousMode = false;
        this.voiceCommands = new Map();
        this.voiceHistory = [];
        this.audioContext = null;
        this.processor = null;
        this.source = null;
        
        this.init();
    }

    async init() {
        console.log('JARVIS Enhanced Voice Processor initializing...');
        
        await this.setupAdvancedAudio();
        this.setupVoiceCommands();
        this.loadSettings();
        
        // Listen for wake word activation
        window.addEventListener('jarvisWakeWordActivated', (event) => {
            this.onWakeWordActivated(event.detail);
        });
        
        console.log('JARVIS Enhanced Voice Processor ready');
    }

    async setupAdvancedAudio() {
        try {
            // Create audio context with optimal settings
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 44100,
                latencyHint: 'interactive'
            });

            // Get high-quality audio stream
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: this.noiseReductionEnabled,
                    autoGainControl: true,
                    sampleRate: 44100,
                    channelCount: 1,
                    volume: 1.0
                }
            });

            this.source = this.audioContext.createMediaStreamSource(stream);
            
            // Create audio processor for real-time analysis
            if (this.audioContext.createScriptProcessor) {
                this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
                this.source.connect(this.processor);
                this.processor.connect(this.audioContext.destination);
                
                this.processor.onaudioprocess = (event) => {
                    this.processAudioFrame(event);
                };
            }

            // Create analyzer for frequency analysis
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;
            this.source.connect(this.analyser);
            
        } catch (error) {
            console.warn('Advanced audio setup failed, using fallback:', error);
        }
    }

    processAudioFrame(event) {
        if (!this.isProcessing) return;
        
        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        
        // Apply noise reduction
        const cleanedData = this.applyNoiseReduction(inputData);
        
        // Analyze voice activity
        const voiceActivity = this.detectVoiceActivity(cleanedData);
        
        // Calculate voice confidence
        const confidence = this.calculateVoiceConfidence(cleanedData);
        
        // Update real-time metrics
        this.updateVoiceMetrics(voiceActivity, confidence);
    }

    applyNoiseReduction(audioData) {
        if (!this.noiseReductionEnabled) return audioData;
        
        // Simple noise reduction using spectral gating
        const fftSize = 2048;
        const hopLength = 512;
        const cleanedData = new Float32Array(audioData.length);
        
        // Apply simple high-pass filter to remove low-frequency noise
        for (let i = 1; i < audioData.length; i++) {
            cleanedData[i] = audioData[i] - (audioData[i - 1] * 0.97);
        }
        
        // Apply dynamic range compression
        for (let i = 0; i < cleanedData.length; i++) {
            const sample = Math.abs(cleanedData[i]);
            if (sample > 0.1) {
                cleanedData[i] *= 0.8;
            }
        }
        
        return cleanedData;
    }

    detectVoiceActivity(audioData) {
        // Calculate RMS (Root Mean Square) for voice activity detection
        let sum = 0;
        for (let i = 0; i < audioData.length; i++) {
            sum += audioData[i] * audioData[i];
        }
        const rms = Math.sqrt(sum / audioData.length);
        
        // Convert to voice activity score (0-1)
        const voiceActivity = Math.min(1, rms / 0.1);
        
        return voiceActivity;
    }

    calculateVoiceConfidence(audioData) {
        // Analyze spectral characteristics for confidence scoring
        const spectralCentroid = this.calculateSpectralCentroid(audioData);
        const zeroCrossingRate = this.calculateZeroCrossingRate(audioData);
        const energy = this.calculateEnergy(audioData);
        
        // Combine factors for confidence score
        let confidence = 0;
        
        // Higher spectral centroid indicates speech
        if (spectralCentroid > 1000) confidence += 0.3;
        
        // Moderate zero crossing rate indicates speech
        if (zeroCrossingRate > 0.05 && zeroCrossingRate < 0.3) confidence += 0.3;
        
        // Adequate energy level
        if (energy > 0.01) confidence += 0.4;
        
        return Math.min(1, confidence);
    }

    calculateSpectralCentroid(audioData) {
        // Simplified spectral centroid calculation
        const fft = this.simpleFFT(audioData);
        let weightedSum = 0;
        let magnitudeSum = 0;
        
        for (let i = 0; i < fft.length; i++) {
            const magnitude = Math.abs(fft[i]);
            weightedSum += i * magnitude;
            magnitudeSum += magnitude;
        }
        
        return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
    }

    calculateZeroCrossingRate(audioData) {
        let crossings = 0;
        for (let i = 1; i < audioData.length; i++) {
            if ((audioData[i] >= 0) !== (audioData[i - 1] >= 0)) {
                crossings++;
            }
        }
        return crossings / audioData.length;
    }

    calculateEnergy(audioData) {
        let energy = 0;
        for (let i = 0; i < audioData.length; i++) {
            energy += audioData[i] * audioData[i];
        }
        return energy / audioData.length;
    }

    simpleFFT(audioData) {
        // Simplified FFT implementation for basic frequency analysis
        // In a real implementation, you'd use a proper FFT library
        const fft = new Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
            fft[i] = audioData[i];
        }
        return fft;
    }

    updateVoiceMetrics(voiceActivity, confidence) {
        // Update UI indicators
        this.updateVoiceActivityIndicator(voiceActivity);
        this.updateConfidenceIndicator(confidence);
        
        // Log metrics for analysis
        if (voiceActivity > this.voiceActivityThreshold) {
            this.logVoiceMetrics(voiceActivity, confidence);
        }
    }

    updateVoiceActivityIndicator(activity) {
        const indicator = document.getElementById('voiceActivityIndicator');
        if (indicator) {
            indicator.style.width = `${activity * 100}%`;
            indicator.style.background = activity > 0.7 ? '#ff4444' : '#00ff00';
        }
    }

    updateConfidenceIndicator(confidence) {
        const indicator = document.getElementById('confidenceIndicator');
        if (indicator) {
            indicator.textContent = `${Math.round(confidence * 100)}%`;
            indicator.style.color = confidence > 0.8 ? '#00ff00' : confidence > 0.6 ? '#ffaa00' : '#ff4444';
        }
    }

    logVoiceMetrics(activity, confidence) {
        const entry = {
            timestamp: Date.now(),
            voiceActivity: activity,
            confidence: confidence,
            audioLevel: this.getCurrentAudioLevel()
        };
        
        this.voiceHistory.push(entry);
        
        // Keep only last 100 entries
        if (this.voiceHistory.length > 100) {
            this.voiceHistory.shift();
        }
    }

    getCurrentAudioLevel() {
        if (!this.analyser) return 0;
        
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        return average / 255;
    }

    setupVoiceCommands() {
        // Define voice command shortcuts
        this.voiceCommands.set('hey jarvis', { action: 'wakeWord', confidence: 0.9 });
        this.voiceCommands.set('show system info', { action: 'systemInfo', confidence: 0.8 });
        this.voiceCommands.set('open search', { action: 'search', confidence: 0.8 });
        this.voiceCommands.set('show files', { action: 'fileManager', confidence: 0.8 });
        this.voiceCommands.set('what time is it', { action: 'time', confidence: 0.9 });
        this.voiceCommands.set('tell me a joke', { action: 'joke', confidence: 0.8 });
        this.voiceCommands.set('help me', { action: 'help', confidence: 0.7 });
    }

    async processVoiceCommand(transcript, confidence) {
        console.log('JARVIS: Processing voice command:', transcript, 'Confidence:', confidence);
        
        // Check confidence threshold
        if (confidence < this.confidenceThreshold) {
            this.handleLowConfidenceCommand(transcript, confidence);
            return null;
        }
        
        // Look for exact matches in voice commands
        const normalizedTranscript = transcript.toLowerCase().trim();
        for (const [command, config] of this.voiceCommands.entries()) {
            if (normalizedTranscript.includes(command)) {
                return this.executeVoiceCommand(command, config);
            }
        }
        
        // Process as general command
        return this.processGeneralCommand(normalizedTranscript);
    }

    executeVoiceCommand(command, config) {
        console.log('JARVIS: Executing voice command:', command);
        
        // Dispatch event for command execution
        window.dispatchEvent(new CustomEvent('jarvisVoiceCommand', {
            detail: { command, config }
        }));
        
        // Provide immediate feedback
        this.provideCommandFeedback(command);
        
        return config;
    }

    processGeneralCommand(transcript) {
        // Send to core processing
        if (window.jarvisCore) {
            const response = window.jarvisCore.processCommand(transcript);
            this.provideCommandFeedback('general');
            return response;
        }
        return null;
    }

    handleLowConfidenceCommand(transcript, confidence) {
        console.warn('JARVIS: Low confidence command:', transcript, confidence);
        
        const suggestions = [
            "I didn't quite catch that. Could you repeat?",
            "Please speak more clearly.",
            "I need better audio quality to understand you."
        ];
        
        const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        
        if (window.speechHandler) {
            window.speechHandler.speak(suggestion);
        }
        
        // Log low confidence for improvement
        this.logLowConfidenceCommand(transcript, confidence);
    }

    provideCommandFeedback(commandType) {
        // Visual feedback for successful command recognition
        const feedbackElement = document.getElementById('commandFeedback');
        if (feedbackElement) {
            feedbackElement.textContent = `✓ ${commandType}`;
            feedbackElement.style.color = '#00ff00';
            
            setTimeout(() => {
                feedbackElement.textContent = '';
            }, 2000);
        }
        
        // Audio feedback
        if (window.speechHandler) {
            window.speechHandler.speak("Command received", { rate: 1.1, volume: 0.5 });
        }
    }

    logLowConfidenceCommand(transcript, confidence) {
        const logEntry = {
            timestamp: Date.now(),
            transcript,
            confidence,
            audioLevel: this.getCurrentAudioLevel(),
            userAgent: navigator.userAgent
        };
        
        // Store for analysis and improvement
        const lowConfidenceLog = JSON.parse(localStorage.getItem('jarvisLowConfidenceLog') || '[]');
        lowConfidenceLog.push(logEntry);
        
        if (lowConfidenceLog.length > 50) {
            lowConfidenceLog.shift();
        }
        
        localStorage.setItem('jarvisLowConfidenceLog', JSON.stringify(lowConfidenceLog));
    }

    onWakeWordActivated(detail) {
        console.log('JARVIS: Wake word activated, starting enhanced processing');
        
        this.isProcessing = true;
        
        // Adjust settings for active listening
        this.voiceActivityThreshold = 0.2; // Lower threshold for active listening
        this.confidenceThreshold = 0.6; // More lenient during active session
        
        // Start continuous processing
        if (this.continuousMode) {
            this.startContinuousProcessing();
        }
        
        // Provide immediate feedback
        this.speakActivationFeedback();
    }

    startContinuousProcessing() {
        console.log('JARVIS: Starting continuous voice processing');
        
        const processInterval = setInterval(() => {
            if (!this.isProcessing) {
                clearInterval(processInterval);
                return;
            }
            
            const audioLevel = this.getCurrentAudioLevel();
            if (audioLevel > 0.1) { // Voice activity detected
                this.handleContinuousVoiceInput();
            }
        }, 100); // Process every 100ms
    }

    handleContinuousVoiceInput() {
        // Handle continuous voice input without explicit wake words
        // This enables natural conversation flow
        
        const audioLevel = this.getCurrentAudioLevel();
        if (audioLevel > 0.3) {
            // Show listening indicator
            this.showContinuousListeningIndicator();
        }
    }

    showContinuousListeningIndicator() {
        const indicator = document.getElementById('continuousListeningIndicator');
        if (indicator) {
            indicator.style.display = 'block';
            indicator.classList.add('active');
        }
    }

    speakActivationFeedback() {
        if (window.speechHandler) {
            window.speechHandler.speak("Yes, I'm listening", { rate: 1.0, volume: 0.7 });
        }
    }

    // Settings Management
    loadSettings() {
        const settings = localStorage.getItem('jarvisVoiceProcessorSettings');
        if (settings) {
            try {
                const parsed = JSON.parse(settings);
                this.noiseReductionEnabled = parsed.noiseReductionEnabled !== false;
                this.voiceActivityThreshold = parsed.voiceActivityThreshold || 0.3;
                this.confidenceThreshold = parsed.confidenceThreshold || 0.7;
                this.continuousMode = parsed.continuousMode || false;
            } catch (e) {
                console.warn('Failed to load voice processor settings');
            }
        }
    }

    saveSettings() {
        const settings = {
            noiseReductionEnabled: this.noiseReductionEnabled,
            voiceActivityThreshold: this.voiceActivityThreshold,
            confidenceThreshold: this.confidenceThreshold,
            continuousMode: this.continuousMode
        };
        
        localStorage.setItem('jarvisVoiceProcessorSettings', JSON.stringify(settings));
    }

    updateSettings(newSettings) {
        Object.assign(this, newSettings);
        this.saveSettings();
        
        // Apply immediate changes
        if (newSettings.noiseReductionEnabled !== undefined) {
            this.applyNoiseReductionSetting(newSettings.noiseReductionEnabled);
        }
    }

    applyNoiseReductionSetting(enabled) {
        // Reinitialize audio context with new settings
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        setTimeout(() => {
            this.setupAdvancedAudio();
        }, 100);
    }

    // Public API
    startProcessing() {
        this.isProcessing = true;
        console.log('JARVIS: Enhanced voice processing started');
    }

    stopProcessing() {
        this.isProcessing = false;
        console.log('JARVIS: Enhanced voice processing stopped');
    }

    getVoiceMetrics() {
        return {
            isProcessing: this.isProcessing,
            voiceHistory: this.voiceHistory.slice(-10), // Last 10 entries
            currentAudioLevel: this.getCurrentAudioLevel(),
            settings: {
                noiseReductionEnabled: this.noiseReductionEnabled,
                voiceActivityThreshold: this.voiceActivityThreshold,
                confidenceThreshold: this.confidenceThreshold,
                continuousMode: this.continuousMode
            }
        };
    }

    getLowConfidenceCommands() {
        return JSON.parse(localStorage.getItem('jarvisLowConfidenceLog') || '[]');
    }

    clearHistory() {
        this.voiceHistory = [];
        localStorage.removeItem('jarvisLowConfidenceLog');
    }

    // Cleanup
    destroy() {
        this.stopProcessing();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        if (this.processor) {
            this.processor.disconnect();
        }
        
        if (this.source) {
            this.source.disconnect();
        }
    }
}

// Add CSS for voice processing indicators
const style = document.createElement('style');
style.textContent = `
    .voice-processing-indicators {
        position: absolute;
        bottom: 20px;
        right: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 100;
    }
    
    .voice-indicator {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.8);
        border: 1px solid rgba(0, 212, 255, 0.3);
        border-radius: 8px;
        color: #00d4ff;
        font-size: 12px;
        font-family: 'Orbitron', monospace;
        min-width: 150px;
    }
    
    .voice-indicator.active {
        border-color: #00ff00;
        color: #00ff00;
    }
    
    .voice-activity-bar {
        width: 60px;
        height: 4px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
        overflow: hidden;
    }
    
    .voice-activity-fill {
        height: 100%;
        background: linear-gradient(90deg, #00ff00, #00d4ff);
        transition: width 0.1s ease;
    }
    
    .confidence-indicator {
        min-width: 40px;
        text-align: right;
    }
    
    .continuous-listening-indicator {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 20px;
        background: rgba(0, 212, 255, 0.1);
        border: 2px solid #00d4ff;
        border-radius: 15px;
        color: #00d4ff;
        font-family: 'Orbitron', monospace;
        display: none;
        z-index: 50;
    }
    
    .continuous-listening-indicator.active {
        animation: continuousPulse 2s infinite;
    }
    
    @keyframes continuousPulse {
        0%, 100% {
            opacity: 0.7;
            transform: translate(-50%, -50%) scale(1);
        }
        50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.05);
        }
    }
`;
document.head.appendChild(style);

// Initialize enhanced voice processor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedVoiceProcessor = new EnhancedVoiceProcessor();
});
