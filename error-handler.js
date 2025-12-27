// JARVIS Error Handling & User Feedback System
// Comprehensive error management with visual feedback and recovery suggestions

class JarvisErrorHandler {
    constructor() {
        this.errorLog = [];
        this.feedbackQueue = [];
        this.retryAttempts = new Map();
        this.userPreferences = this.loadUserPreferences();
        this.connectionStatus = navigator.onLine;
        
        this.init();
    }

    init() {
        console.log('JARVIS Error Handler initializing...');
        
        this.setupConnectionMonitoring();
        this.setupErrorHandlers();
        this.loadErrorHistory();
        
        console.log('JARVIS Error Handler ready');
    }

    setupConnectionMonitoring() {
        // Monitor network connectivity
        window.addEventListener('online', () => {
            this.connectionStatus = true;
            this.handleConnectionChange(true);
        });

        window.addEventListener('offline', () => {
            this.connectionStatus = false;
            this.handleConnectionChange(false);
        });
    }

    setupErrorHandlers() {
        // Global error handlers
        window.addEventListener('error', (event) => {
            this.handleJavaScriptError(event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handlePromiseRejection(event.reason);
        });

        // Permission-related errors
        document.addEventListener('click', (event) => {
            this.handlePermissionRequests(event);
        }, true);

        // Voice recognition specific errors
        if (window.speechHandler) {
            // Additional error handling will be integrated
        }
    }

    // Error Handling Methods
    handleJavaScriptError(error) {
        const errorInfo = {
            type: 'javascript',
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            severity: this.assessErrorSeverity(error)
        };

        console.error('JARVIS JavaScript Error:', errorInfo);
        this.logError(errorInfo);
        this.provideErrorFeedback(errorInfo);
        this.attemptRecovery(errorInfo);
    }

    handlePromiseRejection(reason) {
        const errorInfo = {
            type: 'promise',
            message: reason.message || reason.toString(),
            stack: reason.stack,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            severity: 'medium'
        };

        console.error('JARVIS Promise Rejection:', errorInfo);
        this.logError(errorInfo);
        this.provideErrorFeedback(errorInfo);
    }

    handleVoiceRecognitionError(error) {
        const errorInfo = {
            type: 'voice-recognition',
            message: error.message || error.error,
            error: error,
            timestamp: new Date().toISOString(),
            severity: this.mapVoiceErrorToSeverity(error.error),
            context: 'speech-recognition'
        };

        console.error('JARVIS Voice Recognition Error:', errorInfo);
        this.logError(errorInfo);
        this.provideVoiceErrorFeedback(errorInfo);
        this.suggestVoiceErrorSolutions(errorInfo);
    }

    handlePermissionError(error, permissionType) {
        const errorInfo = {
            type: 'permission',
            message: error.message,
            permission: permissionType,
            timestamp: new Date().toISOString(),
            severity: 'high',
            context: permissionType
        };

        console.error('JARVIS Permission Error:', errorInfo);
        this.logError(errorInfo);
        this.providePermissionErrorFeedback(errorInfo);
        this.guidePermissionSetup(errorInfo);
    }

    handleConnectionChange(isOnline) {
        const status = isOnline ? 'online' : 'offline';
        const errorInfo = {
            type: 'connection',
            message: `Connection ${status}`,
            timestamp: new Date().toISOString(),
            severity: 'low',
            context: 'network'
        };

        this.logError(errorInfo);
        this.provideConnectionFeedback(errorInfo);
        
        if (!isOnline) {
            this.activateOfflineMode();
        } else {
            this.deactivateOfflineMode();
        }
    }

    // Error Severity Assessment
    assessErrorSeverity(error) {
        const message = error.message.toLowerCase();
        
        if (message.includes('memory') || message.includes('quota')) {
            return 'critical';
        }
        
        if (message.includes('permission') || message.includes('denied')) {
            return 'high';
        }
        
        if (message.includes('network') || message.includes('connection')) {
            return 'medium';
        }
        
        return 'low';
    }

    mapVoiceErrorToSeverity(voiceError) {
        const severityMap = {
            'no-speech': 'medium',
            'audio-capture': 'high',
            'not-allowed': 'high',
            'network': 'medium',
            'aborted': 'low',
            'service-not-allowed': 'high'
        };
        
        return severityMap[voiceError] || 'medium';
    }

    // Error Feedback Methods
    provideErrorFeedback(errorInfo) {
        const feedback = {
            message: this.generateErrorMessage(errorInfo),
            type: this.getFeedbackType(errorInfo.severity),
            actions: this.getErrorActions(errorInfo),
            timestamp: Date.now()
        };

        this.displayFeedback(feedback);
        this.addToFeedbackQueue(feedback);
    }

    provideVoiceErrorFeedback(errorInfo) {
        const voiceMessages = {
            'no-speech': "I didn't hear anything. Please try speaking louder or check your microphone.",
            'audio-capture': "I can't access your microphone. Please check your microphone connection.",
            'not-allowed': "I need microphone permission to hear you. Please enable microphone access.",
            'network': "There's a network issue with speech recognition. Please check your connection.",
            'aborted': "Speech recognition was cancelled.",
            'service-not-allowed': "Speech recognition service is not available in your browser."
        };

        const message = voiceMessages[errorInfo.error] || errorInfo.message;
        
        const feedback = {
            message: message,
            type: 'warning',
            actions: [
                { label: 'Retry', action: 'retry-voice' },
                { label: 'Settings', action: 'open-permissions' }
            ],
            timestamp: Date.now()
        };

        this.displayFeedback(feedback);
        
        // Provide audio feedback
        if (window.speechHandler) {
            window.speechHandler.speak(message);
        }
    }

    providePermissionErrorFeedback(errorInfo) {
        const permissionMessages = {
            'microphone': 'Microphone access is required for voice commands. Please allow microphone access when prompted.',
            'camera': 'Camera access is needed for some features. Please allow camera permissions.',
            'notifications': 'Notifications help keep you informed. Please enable notification permissions.'
        };

        const message = permissionMessages[errorInfo.permission] || errorInfo.message;
        
        const feedback = {
            message: message,
            type: 'error',
            persistent: true,
            actions: [
                { label: 'Enable', action: 'request-permission', permission: errorInfo.permission },
                { label: 'Learn More', action: 'show-permission-help', permission: errorInfo.permission }
            ],
            timestamp: Date.now()
        };

        this.displayFeedback(feedback);
    }

    provideConnectionFeedback(errorInfo) {
        if (errorInfo.message.includes('offline')) {
            const feedback = {
                message: 'You are currently offline. Some features may be limited.',
                type: 'warning',
                actions: [
                    { label: 'Retry', action: 'check-connection' }
                ],
                timestamp: Date.now()
            };
        } else {
            const feedback = {
                message: 'Connection restored! All features are now available.',
                type: 'success',
                autoHide: true,
                timestamp: Date.now()
            };
        }

        this.displayFeedback(feedback);
    }

    // Message Generation
    generateErrorMessage(errorInfo) {
        const messageTemplates = {
            'javascript': {
                'critical': 'A serious error occurred. Some features may not work properly.',
                'high': 'An important feature encountered an error.',
                'medium': 'Something went wrong, but I can continue helping.',
                'low': 'A minor issue occurred.'
            },
            'voice-recognition': {
                'high': 'Voice recognition is not working properly.',
                'medium': 'Voice recognition encountered an issue.',
                'low': 'Voice recognition was interrupted.'
            },
            'permission': {
                'high': 'Required permissions are missing for full functionality.',
                'medium': 'Some permissions may improve your experience.'
            },
            'connection': {
                'low': 'Network connectivity has changed.'
            }
        };

        const templates = messageTemplates[errorInfo.type] || messageTemplates['javascript'];
        return templates[errorInfo.severity] || errorInfo.message || 'An unexpected error occurred.';
    }

    getFeedbackType(severity) {
        const typeMap = {
            'critical': 'error',
            'high': 'error',
            'medium': 'warning',
            'low': 'info'
        };
        
        return typeMap[severity] || 'info';
    }

    getErrorActions(errorInfo) {
        const actionTemplates = {
            'javascript': [
                { label: 'Refresh', action: 'refresh-page' },
                { label: 'Report', action: 'report-error' }
            ],
            'voice-recognition': [
                { label: 'Retry', action: 'retry-voice' },
                { label: 'Settings', action: 'open-permissions' }
            ],
            'permission': [
                { label: 'Enable', action: 'request-permission' },
                { label: 'Learn More', action: 'show-permission-help' }
            ],
            'connection': [
                { label: 'Check', action: 'check-connection' },
                { label: 'Retry', action: 'retry-action' }
            ]
        };

        return actionTemplates[errorInfo.type] || [
            { label: 'Retry', action: 'retry-action' }
        ];
    }

    // Visual Feedback Display
    displayFeedback(feedback) {
        const notification = this.createNotificationElement(feedback);
        this.showNotification(notification);
        
        if (feedback.autoHide) {
            setTimeout(() => {
                this.hideNotification(notification);
            }, 5000);
        }
    }

    createNotificationElement(feedback) {
        const notification = document.createElement('div');
        notification.className = `jarvis-notification notification-${feedback.type}`;
        notification.setAttribute('data-type', feedback.type);
        notification.setAttribute('data-timestamp', feedback.timestamp);
        
        const iconMap = {
            'error': '⚠️',
            'warning': '⚠️',
            'success': '✅',
            'info': 'ℹ️'
        };

        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${iconMap[feedback.type] || 'ℹ️'}</div>
                <div class="notification-message">${feedback.message}</div>
                ${feedback.actions ? this.createActionButtons(feedback.actions) : ''}
            </div>
            <button class="notification-close">×</button>
        `;

        // Add event listeners for actions
        if (feedback.actions) {
            feedback.actions.forEach((action, index) => {
                const button = notification.querySelector(`[data-action="${action.action}"]`);
                if (button) {
                    button.addEventListener('click', () => {
                        this.handleAction(action.action, action.permission);
                    });
                }
            });
        }

        // Add close button listener
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });

        return notification;
    }

    createActionButtons(actions) {
        return `
            <div class="notification-actions">
                ${actions.map(action => 
                    `<button class="notification-action" data-action="${action.action}">${action.label}</button>`
                ).join('')}
            </div>
        `;
    }

    showNotification(notification) {
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        // Update queue
        this.feedbackQueue.push(notification);
    }

    hideNotification(notification) {
        notification.classList.remove('show');
        notification.classList.add('hide');
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            
            // Remove from queue
            const index = this.feedbackQueue.indexOf(notification);
            if (index > -1) {
                this.feedbackQueue.splice(index, 1);
            }
        }, 300);
    }

    // Action Handlers
    handleAction(action, permission) {
        switch (action) {
            case 'retry-voice':
                this.retryVoiceRecognition();
                break;
            case 'open-permissions':
                this.openPermissionSettings();
                break;
            case 'request-permission':
                this.requestPermission(permission);
                break;
            case 'show-permission-help':
                this.showPermissionHelp(permission);
                break;
            case 'check-connection':
                this.checkConnection();
                break;
            case 'refresh-page':
                this.refreshPage();
                break;
            case 'report-error':
                this.reportError();
                break;
            default:
                console.log('Unknown action:', action);
        }
        
        // Hide notification after action
        const notification = document.querySelector(`[data-action="${action}"]`)?.closest('.jarvis-notification');
        if (notification) {
            this.hideNotification(notification);
        }
    }

    retryVoiceRecognition() {
        if (window.speechHandler) {
            window.speechHandler.stopListening();
            setTimeout(() => {
                window.speechHandler.startListening();
            }, 1000);
        }
    }

    openPermissionSettings() {
        // Most browsers don't allow programmatic opening of settings
        // Provide guidance instead
        this.showNotification({
            message: 'Please enable microphone permissions in your browser settings and refresh the page.',
            type: 'info'
        });
    }

    async requestPermission(permission) {
        try {
            let result;
            
            switch (permission) {
                case 'microphone':
                    result = await navigator.mediaDevices.getUserMedia({ audio: true });
                    result.getTracks().forEach(track => track.stop()); // Stop immediately
                    break;
                case 'camera':
                    result = await navigator.mediaDevices.getUserMedia({ video: true });
                    result.getTracks().forEach(track => track.stop());
                    break;
                case 'notifications':
                    result = await Notification.requestPermission();
                    break;
            }
            
            this.showNotification({
                message: `${permission} permission granted!`,
                type: 'success'
            });
            
        } catch (error) {
            this.handlePermissionError(error, permission);
        }
    }

    showPermissionHelp(permission) {
        const helpMessages = {
            'microphone': 'Microphone permission allows JARVIS to hear your voice commands for hands-free interaction.',
            'camera': 'Camera permission enables visual features and enhances the user experience.',
            'notifications': 'Notifications keep you informed about JARVIS activities and important updates.'
        };
        
        const message = helpMessages[permission] || 'Learn more about permissions in your browser settings.';
        
        this.showNotification({
            message: message,
            type: 'info'
        });
    }

    checkConnection() {
        if (navigator.onLine) {
            this.showNotification({
                message: 'Connection is working properly!',
                type: 'success'
            });
        } else {
            this.showNotification({
                message: 'No internet connection detected.',
                type: 'warning'
            });
        }
    }

    refreshPage() {
        window.location.reload();
    }

    reportError() {
        const errorReport = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            errors: this.errorLog.slice(-10), // Last 10 errors
            userAgentData: navigator.userAgentData
        };
        
        console.log('JARVIS Error Report:', errorReport);
        
        this.showNotification({
            message: 'Error report generated in console. Thank you for helping improve JARVIS!',
            type: 'success'
        });
    }

    // Recovery Systems
    attemptRecovery(errorInfo) {
        const retryKey = `${errorInfo.type}-${errorInfo.context || 'default'}`;
        const attempts = this.retryAttempts.get(retryKey) || 0;
        
        if (attempts < 3) {
            setTimeout(() => {
                this.performRecovery(errorInfo);
                this.retryAttempts.set(retryKey, attempts + 1);
            }, 2000 * (attempts + 1)); // Exponential backoff
        }
    }

    performRecovery(errorInfo) {
        switch (errorInfo.type) {
            case 'voice-recognition':
                this.attemptVoiceRecovery();
                break;
            case 'permission':
                this.attemptPermissionRecovery(errorInfo);
                break;
            case 'javascript':
                this.attemptJavaScriptRecovery(errorInfo);
                break;
        }
    }

    attemptVoiceRecovery() {
        // Try to restart voice recognition
        if (window.speechHandler) {
            window.speechHandler.stopListening();
            setTimeout(() => {
                window.speechHandler.startListening();
            }, 1000);
        }
    }

    attemptPermissionRecovery(errorInfo) {
        // Suggest alternative approaches
        if (errorInfo.permission === 'microphone') {
            this.showNotification({
                message: 'Voice features are limited without microphone access. You can still use keyboard commands.',
                type: 'info'
            });
        }
    }

    attemptJavaScriptRecovery(errorInfo) {
        // Reset affected systems
        if (errorInfo.message.includes('jarvis')) {
            // Reset JARVIS components
            this.resetJarvisComponents();
        }
    }

    resetJarvisComponents() {
        // Reset core systems
        if (window.jarvisCore) {
            // Reinitialize if needed
            console.log('JARVIS: Resetting core components');
        }
        
        if (window.wakeWordDetector) {
            // Reset wake word detection
            console.log('JARVIS: Resetting wake word detection');
        }
    }

    // Offline Mode
    activateOfflineMode() {
        console.log('JARVIS: Activating offline mode');
        
        // Disable features that require internet
        this.disableOnlineFeatures();
        
        // Show offline notification
        this.showNotification({
            message: 'JARVIS is now in offline mode. Some features are limited.',
            type: 'warning',
            persistent: true
        });
    }

    deactivateOfflineMode() {
        console.log('JARVIS: Deactivating offline mode');
        
        // Re-enable online features
        this.enableOnlineFeatures();
        
        // Show success notification
        this.showNotification({
            message: 'Connection restored! All features are now available.',
            type: 'success'
        });
    }

    disableOnlineFeatures() {
        // Disable search, external API calls, etc.
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.disabled = true;
            searchBtn.style.opacity = '0.5';
        }
    }

    enableOnlineFeatures() {
        // Re-enable online features
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.disabled = false;
            searchBtn.style.opacity = '1';
        }
    }

    // Data Management
    logError(errorInfo) {
        this.errorLog.push(errorInfo);
        
        // Keep only last 50 errors
        if (this.errorLog.length > 50) {
            this.errorLog.shift();
        }
        
        // Persist to localStorage
        localStorage.setItem('jarvisErrorLog', JSON.stringify(this.errorLog));
    }

    loadErrorHistory() {
        const stored = localStorage.getItem('jarvisErrorLog');
        if (stored) {
            try {
                this.errorLog = JSON.parse(stored);
            } catch (e) {
                console.warn('Failed to load error history');
                this.errorLog = [];
            }
        }
    }

    loadUserPreferences() {
        const stored = localStorage.getItem('jarvisErrorPreferences');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.warn('Failed to load user preferences');
            }
        }
        
        return {
            showNotifications: true,
            enableRecovery: true,
            reportErrors: false
        };
    }

    // Public API
    getErrorStats() {
        const now = new Date();
        const last24Hours = this.errorLog.filter(error => 
            new Date(error.timestamp) > new Date(now.getTime() - 24 * 60 * 60 * 1000)
        );
        
        return {
            total: this.errorLog.length,
            last24Hours: last24Hours.length,
            byType: this.groupErrorsByType(),
            bySeverity: this.groupErrorsBySeverity()
        };
    }

    groupErrorsByType() {
        return this.errorLog.reduce((groups, error) => {
            groups[error.type] = (groups[error.type] || 0) + 1;
            return groups;
        }, {});
    }

    groupErrorsBySeverity() {
        return this.errorLog.reduce((groups, error) => {
            groups[error.severity] = (groups[error.severity] || 0) + 1;
            return groups;
        }, {});
    }

    clearErrorLog() {
        this.errorLog = [];
        localStorage.removeItem('jarvisErrorLog');
    }

    // Integration with other systems
    integrateWithSpeechHandler() {
        if (window.speechHandler) {
            // Override speech handler error handling
            const originalOnError = window.speechHandler.onSpeechError;
            window.speechHandler.onSpeechError = (event) => {
                this.handleVoiceRecognitionError(event);
                if (originalOnError) {
                    originalOnError.call(window.speechHandler, event);
                }
            };
        }
    }

    // Cleanup
    destroy() {
        // Clean up event listeners
        window.removeEventListener('error', this.handleJavaScriptError);
        window.removeEventListener('unhandledrejection', this.handlePromiseRejection);
        
        // Clear feedback queue
        this.feedbackQueue.forEach(notification => {
            this.hideNotification(notification);
        });
    }
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    .jarvis-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 400px;
        background: rgba(0, 0, 0, 0.9);
        border: 2px solid;
        border-radius: 12px;
        padding: 16px;
        z-index: 10000;
        transform: translateX(100%);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(15px);
        font-family: 'Orbitron', monospace;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    
    .jarvis-notification.show {
        transform: translateX(0);
    }
    
    .jarvis-notification.hide {
        transform: translateX(100%);
        opacity: 0;
    }
    
    .notification-error {
        border-color: #ff4444;
        background: rgba(255, 68, 68, 0.1);
        color: #ff4444;
    }
    
    .notification-warning {
        border-color: #ffaa00;
        background: rgba(255, 170, 0, 0.1);
        color: #ffaa00;
    }
    
    .notification-success {
        border-color: #00ff00;
        background: rgba(0, 255, 0, 0.1);
        color: #00ff00;
    }
    
    .notification-info {
        border-color: #00d4ff;
        background: rgba(0, 212, 255, 0.1);
        color: #00d4ff;
    }
    
    .notification-content {
        display: flex;
        align-items: flex-start;
        gap: 12px;
    }
    
    .notification-icon {
        font-size: 18px;
        flex-shrink: 0;
    }
    
    .notification-message {
        flex: 1;
        font-size: 14px;
        line-height: 1.4;
    }
    
    .notification-actions {
        margin-top: 12px;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }
    
    .notification-action {
        padding: 6px 12px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid currentColor;
        border-radius: 6px;
        color: inherit;
        font-size: 12px;
        font-family: inherit;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .notification-action:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-1px);
    }
    
    .notification-close {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 24px;
        height: 24px;
        background: none;
        border: none;
        color: inherit;
        font-size: 18px;
        cursor: pointer;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s ease;
    }
    
    .notification-close:hover {
        background: rgba(255, 255, 255, 0.1);
    }
    
    .jarvis-notification[data-persistent="true"] {
        border-width: 3px;
    }
`;
document.head.appendChild(style);

// Initialize error handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.errorHandler = new JarvisErrorHandler();
    
    // Integrate with speech handler
    window.errorHandler.integrateWithSpeechHandler();
});
