// JARVIS Speech Handler
// Voice recognition and text-to-speech functionality

class SpeechHandler {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.voices = [];
        this.currentVoice = null;
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        this.initializeSpeechRecognition();
        this.loadVoices();
        this.setupEventListeners();
        
        // Load voices when they become available
        if (this.synthesis.onvoiceschanged !== undefined) {
            this.synthesis.onvoiceschanged = () => this.loadVoices();
        }
    }

    initializeSpeechRecognition() {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn('Speech recognition not supported in this browser');
            return;
        }

        this.recognition = new SpeechRecognition();
        
        // Configure recognition settings
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1;

        // Set up event listeners
        this.recognition.onstart = () => {
            this.isListening = true;
            this.onListeningStart();
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.onListeningEnd();
        };

        this.recognition.onresult = (event) => {
            this.onSpeechResult(event);
        };

        this.recognition.onerror = (event) => {
            this.onSpeechError(event);
        };

        this.isInitialized = true;
    }

    loadVoices() {
        this.voices = this.synthesis.getVoices();
        
        // Select a preferred voice
        this.currentVoice = this.voices.find(voice => 
            voice.name.includes('Google') || 
            voice.name.includes('Microsoft') ||
            voice.name.includes('Natural') ||
            voice.name.includes('Enhanced')
        ) || this.voices[0];
    }

    setupEventListeners() {
        // Voice button click handler
        const voiceBtn = document.getElementById('voiceBtn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => {
                this.toggleListening();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space' && !event.target.matches('input, textarea')) {
                event.preventDefault();
                this.toggleListening();
            }
        });
    }

    toggleListening() {
        if (!this.isInitialized) {
            this.speak("Speech recognition is not available in your browser. Please use a modern browser like Chrome or Edge.");
            return;
        }

        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    startListening() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
                this.speak("I'm listening. What's your command?");
            } catch (error) {
                console.error('Error starting speech recognition:', error);
                this.speak("I had a small glitch there. Let's try that again.");
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
        console.log('JARVIS: Started listening');
        
        // Update UI
        this.updateVoiceUI(true);
        
        // Visual feedback
        this.showListeningIndicator();
    }

    onListeningEnd() {
        console.log('JARVIS: Stopped listening');
        
        // Update UI
        this.updateVoiceUI(false);
        
        // Hide listening indicator
        this.hideListeningIndicator();
    }

    onSpeechResult(event) {
        const result = event.results[0];
        const transcript = result[0].transcript.toLowerCase().trim();
        const confidence = result[0].confidence;

        console.log('JARVIS: Speech recognized:', transcript, 'Confidence:', confidence);

        // Process the command
        if (window.jarvisCore) {
            const response = window.jarvisCore.processCommand(transcript);
            
            // Speak the response
            setTimeout(() => {
                this.speak(response);
            }, 500);
        }

        // Log successful recognition
        this.logVoiceCommand(transcript, confidence);
    }

    onSpeechError(event) {
        console.error('JARVIS: Speech recognition error:', event.error);
        
        let errorMessage = "I didn't catch that. Please try again.";
        
        switch (event.error) {
            case 'no-speech':
                errorMessage = "I didn't hear anything. Please speak louder.";
                break;
            case 'audio-capture':
                errorMessage = "I can't access your microphone. Please check your permissions.";
                break;
            case 'not-allowed':
                errorMessage = "Microphone access is not allowed. Please enable microphone permissions.";
                break;
            case 'network':
                errorMessage = "There's a network issue with speech recognition. Please check your connection.";
                break;
            case 'aborted':
                errorMessage = "Speech recognition was cancelled.";
                break;
        }
        
        this.speak(errorMessage);
        this.updateVoiceUI(false);
    }

    // UI Update Methods
    updateVoiceUI(isListening) {
        const voiceBtn = document.getElementById('voiceBtn');
        const speechIndicator = document.getElementById('speechIndicator');
        
        if (voiceBtn) {
            const btnIcon = voiceBtn.querySelector('.btn-icon');
            const btnText = voiceBtn.querySelector('.btn-text');
            
            if (isListening) {
                btnIcon.textContent = '🔴';
                btnText.textContent = 'Listening...';
                voiceBtn.classList.add('listening');
            } else {
                btnIcon.textContent = '🎤';
                btnText.textContent = 'Voice Command';
                voiceBtn.classList.remove('listening');
            }
        }
        
        if (speechIndicator) {
            if (isListening) {
                speechIndicator.classList.add('active');
            } else {
                speechIndicator.classList.remove('active');
            }
        }
    }

    showListeningIndicator() {
        const speechIndicator = document.getElementById('speechIndicator');
        if (speechIndicator) {
            speechIndicator.style.display = 'flex';
            speechIndicator.classList.add('listening');
        }
    }

    hideListeningIndicator() {
        const speechIndicator = document.getElementById('speechIndicator');
        if (speechIndicator) {
            speechIndicator.classList.remove('listening');
        }
    }

    // Text-to-Speech
    speak(text, options = {}) {
        if (!this.synthesis) {
            console.warn('Speech synthesis not supported');
            return;
        }

        // Cancel any ongoing speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Apply settings
        utterance.voice = this.currentVoice;
        utterance.rate = options.rate || 0.8;
        utterance.pitch = options.pitch || 0.8;
        utterance.volume = options.volume || 0.8;

        // Set up event listeners
        utterance.onstart = () => {
            console.log('JARVIS: Started speaking');
            this.onSpeechStart();
        };

        utterance.onend = () => {
            console.log('JARVIS: Finished speaking');
            this.onSpeechEnd();
        };

        utterance.onerror = (event) => {
            console.error('JARVIS: Speech synthesis error:', event.error);
            this.onSpeechError(event);
        };

        // Speak the text
        this.synthesis.speak(utterance);
    }

    onSpeechStart() {
        // Visual feedback for speaking
        const speechIndicator = document.getElementById('speechIndicator');
        if (speechIndicator) {
            speechIndicator.classList.add('speaking');
        }
    }

    onSpeechEnd() {
        // Remove speaking visual feedback
        const speechIndicator = document.getElementById('speechIndicator');
        if (speechIndicator) {
            speechIndicator.classList.remove('speaking');
        }
    }

    // Utility Methods
    logVoiceCommand(transcript, confidence) {
        const logEntry = {
            timestamp: new Date(),
            command: transcript,
            confidence: confidence,
            success: confidence > 0.7
        };

        // Store in localStorage for persistence
        const voiceLog = JSON.parse(localStorage.getItem('jarvisVoiceLog') || '[]');
        voiceLog.push(logEntry);
        
        // Keep only last 50 entries
        if (voiceLog.length > 50) {
            voiceLog.splice(0, voiceLog.length - 50);
        }
        
        localStorage.setItem('jarvisVoiceLog', JSON.stringify(voiceLog));
    }

    getVoiceLog() {
        return JSON.parse(localStorage.getItem('jarvisVoiceLog') || '[]');
    }

    clearVoiceLog() {
        localStorage.removeItem('jarvisVoiceLog');
    }

    // Voice Settings
    setVoice(voiceName) {
        const voice = this.voices.find(v => v.name === voiceName);
        if (voice) {
            this.currentVoice = voice;
            return true;
        }
        return false;
    }

    getAvailableVoices() {
        return this.voices.map(voice => ({
            name: voice.name,
            lang: voice.lang,
            local: voice.localService
        }));
    }

    setSpeechRate(rate) {
        if (rate >= 0.1 && rate <= 10) {
            this.speechRate = rate;
            return true;
        }
        return false;
    }

    setSpeechPitch(pitch) {
        if (pitch >= 0 && pitch <= 2) {
            this.speechPitch = pitch;
            return true;
        }
        return false;
    }

    setSpeechVolume(volume) {
        if (volume >= 0 && volume <= 1) {
            this.speechVolume = volume;
            return true;
        }
        return false;
    }

    // Wake word integration
    startActiveListening() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
                
                // Trigger animation
                if (window.animationEngine) {
                    window.animationEngine.triggerAnimation('listening');
                }
                
                this.speak("I'm listening. Please speak now.");
            } catch (error) {
                console.error('Error starting active listening:', error);
                
                // Trigger error animation
                if (window.animationEngine) {
                    window.animationEngine.triggerAnimation('error');
                }
                
                this.speak("I encountered an error starting speech recognition. Please try again.");
            }
        }
    }

    // Public API
    isSpeechRecognitionSupported() {
        return this.isInitialized;
    }

    isSpeechSynthesisSupported() {
        return 'speechSynthesis' in window;
    }

    isCurrentlyListening() {
        return this.isListening;
    }

    isCurrentlySpeaking() {
        return this.synthesis.speaking;
    }

    stopSpeaking() {
        this.synthesis.cancel();
    }

    // Wake word detection (future enhancement)
    initializeWakeWordDetection() {
        // This would implement wake word detection like "Hey Jarvis"
        // Requires additional libraries like snowboy or similar
        console.log('Wake word detection would be initialized here');
    }
}

// Initialize speech handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.speechHandler = new SpeechHandler();
});
