// JARVIS Wake Word Detection System
// "Hey JARVIS" activation with continuous background listening

class WakeWordDetector {
    constructor() {
        this.isActive = false;
        this.isListening = false;
        this.recognition = null;
        this.wakeWords = ['hey jarvis', 'jarvis', 'hey jarvis please'];
        this.confidenceThreshold = 0.8;
        this.backgroundMode = false;
        this.sensitivity = 0.7;
        
        // Audio analysis for voice activity detection
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.dataArray = null;
        
        this.init();
    }

    async init() {
        console.log('JARVIS Wake Word Detector initializing...');
        
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('Speech recognition not supported - wake word detection disabled');
            return;
        }

        this.setupSpeechRecognition();
        await this.setupAudioAnalysis();
        
        // Load saved settings
        this.loadSettings();
        
        console.log('JARVIS Wake Word Detector ready');
    }

    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 3;

        this.recognition.onstart = () => {
            this.isListening = true;
            this.onListeningStart();
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.onListeningEnd();
            
            // Auto-restart if in background mode
            if (this.backgroundMode && this.isActive) {
                setTimeout(() => {
                    this.startListening();
                }, 100);
            }
        };

        this.recognition.onresult = (event) => {
            this.onSpeechResult(event);
        };

        this.recognition.onerror = (event) => {
            this.onSpeechError(event);
        };
    }

    async setupAudioAnalysis() {
        try {
            // Get user media for audio analysis
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });

            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;
            
            this.microphone.connect(this.analyser);
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            
            // Start monitoring audio levels
            this.startAudioMonitoring();
            
        } catch (error) {
            console.warn('Audio analysis setup failed:', error);
        }
    }

    startAudioMonitoring() {
        if (!this.analyser) return;

        const monitorAudio = () => {
            if (!this.isActive) return;
            
            this.analyser.getByteFrequencyData(this.dataArray);
            
            // Calculate average volume
            const average = this.dataArray.reduce((sum, value) => sum + value, 0) / this.dataArray.length;
            
            // Detect voice activity
            if (average > 30) { // Threshold for voice activity
                this.onVoiceActivityDetected();
            }
            
            requestAnimationFrame(monitorAudio);
        };
        
        monitorAudio();
    }

    // Public API
    async activate() {
        if (this.isActive) return;
        
        this.isActive = true;
        console.log('JARVIS Wake Word Detection activated');
        
        // Request microphone permission
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            await this.startBackgroundListening();
            this.notifyActivation();
        } catch (error) {
            console.error('Failed to activate wake word detection:', error);
            this.handlePermissionError(error);
        }
    }

    deactivate() {
        this.isActive = false;
        this.backgroundMode = false;
        this.stopListening();
        console.log('JARVIS Wake Word Detection deactivated');
    }

    async startBackgroundListening() {
        if (!this.recognition || this.isListening) return;
        
        this.backgroundMode = true;
        this.startListening();
    }

    startListening() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('Error starting wake word detection:', error);
            }
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    // Event Handlers
    onListeningStart() {
        console.log('JARVIS: Wake word detection listening...');
        this.updateUI('listening');
    }

    onListeningEnd() {
        console.log('JARVIS: Wake word detection stopped');
        this.updateUI('idle');
    }

    onSpeechResult(event) {
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript.toLowerCase().trim();
            const confidence = result[0].confidence;

            console.log('JARVIS Wake Word: Detected:', transcript, 'Confidence:', confidence);

            // Check for wake word
            if (this.isWakeWord(transcript, confidence)) {
                this.triggerWakeWordActivation(transcript);
            }
        }
    }

    onSpeechError(event) {
        console.warn('JARVIS Wake Word Error:', event.error);
        
        // Don't restart on certain errors
        if (['not-allowed', 'service-not-allowed'].includes(event.error)) {
            this.deactivate();
            this.handlePermissionError(event);
        }
    }

    onVoiceActivityDetected() {
        // Visual feedback for voice activity
        this.showVoiceActivityIndicator();
        
        // Could trigger visual effects or animations
        if (window.jarvisUI) {
            window.jarvisUI.onVoiceActivityDetected();
        }
    }

    // Wake Word Detection Logic
    isWakeWord(transcript, confidence) {
        if (confidence < this.confidenceThreshold) return false;
        
        return this.wakeWords.some(wakeWord => {
            // Exact match
            if (transcript === wakeWord) return true;
            
            // Partial match (wake word appears in transcript)
            if (transcript.includes(wakeWord)) return true;
            
            // Fuzzy matching for variations
            return this.fuzzyMatch(transcript, wakeWord);
        });
    }

    fuzzyMatch(transcript, wakeWord) {
        // Simple fuzzy matching for similar words
        const words = transcript.split(' ');
        return words.some(word => {
            const similarity = this.calculateSimilarity(word, wakeWord.split(' ')[0]);
            return similarity > this.sensitivity;
        });
    }

    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    // Activation Handler
    triggerWakeWordActivation(transcript) {
        console.log('JARVIS: Wake word activated!', transcript);
        
        // Stop background listening temporarily
        this.stopListening();
        
        // Visual feedback
        this.showActivationAnimation();
        
        // Notify other components
        this.onWakeWordActivated();
        
        // Brief pause before resuming background listening
        setTimeout(() => {
            if (this.isActive && this.backgroundMode) {
                this.startListening();
            }
        }, 2000);
    }

    onWakeWordActivated() {
        // Dispatch custom event for other components to listen to
        window.dispatchEvent(new CustomEvent('jarvisWakeWordActivated', {
            detail: {
                timestamp: Date.now(),
                activationMethod: 'wake-word'
            }
        }));

        // Trigger animation
        if (window.animationEngine) {
            window.animationEngine.triggerAnimation('wake-word');
        }

        // Notify speech handler to start active listening
        if (window.speechHandler) {
            window.speechHandler.startActiveListening();
        }

        // Provide audio feedback
        this.playActivationSound();
    }

    // UI and Feedback Methods
    updateUI(state) {
        const wakeWordIndicator = document.getElementById('wakeWordIndicator');
        if (wakeWordIndicator) {
            wakeWordIndicator.className = `wake-word-indicator ${state}`;
        }

        // Update status display
        if (window.jarvisCore) {
            const status = state === 'listening' ? 'Wake Word Active' : 'Standby';
            // Could update a status indicator here
        }
    }

    showVoiceActivityIndicator() {
        // Flash indicator briefly when voice is detected
        const indicator = document.getElementById('wakeWordIndicator');
        if (indicator) {
            indicator.classList.add('voice-active');
            setTimeout(() => {
                indicator.classList.remove('voice-active');
            }, 200);
        }
    }

    showActivationAnimation() {
        // Enhanced activation animation
        const core = document.querySelector('.center-core');
        if (core) {
            core.style.animation = 'none';
            core.offsetHeight; // Trigger reflow
            core.style.animation = 'wakeWordActivation 1s ease-out';
        }
    }

    playActivationSound() {
        // Play a subtle activation sound
        if (window.speechHandler) {
            window.speechHandler.speak('Yes?', { rate: 1.2, volume: 0.6 });
        }
    }

    notifyActivation() {
        if (window.jarvisUI) {
            window.jarvisUI.showNotification('JARVIS Wake Word Detection Active', 'success');
        }
    }

    handlePermissionError(error) {
        const message = error.name === 'NotAllowedError' 
            ? 'Microphone access is required for wake word detection'
            : 'Wake word detection requires microphone permissions';
            
        if (window.jarvisUI) {
            window.jarvisUI.showNotification(message, 'error');
        }
    }

    // Settings Management
    loadSettings() {
        const settings = localStorage.getItem('jarvisWakeWordSettings');
        if (settings) {
            try {
                const parsed = JSON.parse(settings);
                this.confidenceThreshold = parsed.confidenceThreshold || 0.8;
                this.sensitivity = parsed.sensitivity || 0.7;
                this.wakeWords = parsed.wakeWords || this.wakeWords;
            } catch (e) {
                console.warn('Failed to load wake word settings');
            }
        }
    }

    saveSettings() {
        const settings = {
            confidenceThreshold: this.confidenceThreshold,
            sensitivity: this.sensitivity,
            wakeWords: this.wakeWords,
            isActive: this.isActive
        };
        
        localStorage.setItem('jarvisWakeWordSettings', JSON.stringify(settings));
    }

    updateSettings(newSettings) {
        Object.assign(this, newSettings);
        this.saveSettings();
    }

    // Training System (Future Enhancement)
    async trainWakeWord() {
        console.log('JARVIS: Starting wake word training...');
        
        // This would implement a training system for custom wake words
        // For now, just log the intention
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('JARVIS: Wake word training would be implemented here');
                resolve();
            }, 2000);
        });
    }

    // Public API
    isActive() {
        return this.isActive;
    }

    isListening() {
        return this.isListening;
    }

    getSettings() {
        return {
            confidenceThreshold: this.confidenceThreshold,
            sensitivity: this.sensitivity,
            wakeWords: this.wakeWords,
            isActive: this.isActive,
            backgroundMode: this.backgroundMode
        };
    }

    addWakeWord(word) {
        if (!this.wakeWords.includes(word.toLowerCase())) {
            this.wakeWords.push(word.toLowerCase());
            this.saveSettings();
        }
    }

    removeWakeWord(word) {
        const index = this.wakeWords.indexOf(word.toLowerCase());
        if (index > -1) {
            this.wakeWords.splice(index, 1);
            this.saveSettings();
        }
    }

    // Cleanup
    destroy() {
        this.deactivate();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        // Clean up event listeners
        if (this.recognition) {
            this.recognition.onstart = null;
            this.recognition.onend = null;
            this.recognition.onresult = null;
            this.recognition.onerror = null;
        }
    }
}

// Add CSS animation for wake word activation
const style = document.createElement('style');
style.textContent = `
    .wake-word-indicator {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 12px;
        height: 12px;
        background: #00ff00;
        border-radius: 50%;
        opacity: 0.3;
        transition: all 0.3s ease;
    }
    
    .wake-word-indicator.listening {
        opacity: 1;
        animation: wakeWordPulse 2s infinite;
    }
    
    .wake-word-indicator.voice-active {
        background: #00d4ff;
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.6);
        transform: scale(1.2);
    }
    
    @keyframes wakeWordPulse {
        0%, 100% {
            opacity: 0.3;
            transform: scale(1);
        }
        50% {
            opacity: 1;
            transform: scale(1.1);
        }
    }
    
    @keyframes wakeWordActivation {
        0% {
            transform: scale(1);
            box-shadow: 0 0 30px rgba(0, 212, 255, 0.6);
        }
        50% {
            transform: scale(1.2);
            box-shadow: 0 0 50px rgba(0, 212, 255, 1);
        }
        100% {
            transform: scale(1);
            box-shadow: 0 0 30px rgba(0, 212, 255, 0.6);
        }
    }
`;
document.head.appendChild(style);

// Initialize wake word detector when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.wakeWordDetector = new WakeWordDetector();
});
