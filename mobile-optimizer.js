// JARVIS Mobile Responsive Enhancement System
// Touch-optimized controls, gestures, and performance optimization

class JarvisMobileOptimizer {
    constructor() {
        this.isMobile = this.detectMobile();
        this.isTablet = this.detectTablet();
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.gestureThreshold = 50;
        this.performanceMode = this.determinePerformanceMode();
        this.batteryOptimization = this.setupBatteryOptimization();
        
        this.init();
    }

    init() {
        console.log('JARVIS Mobile Optimizer initializing...');
        
        if (this.isMobile || this.isTablet) {
            this.enableMobileOptimizations();
        }
        
        this.setupTouchControls();
        this.setupGestureRecognition();
        this.optimizeForMobile();
        this.setupBatteryOptimization();
        
        console.log('JARVIS Mobile Optimizer ready');
    }

    // Device Detection
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    detectTablet() {
        return /iPad|Android(?=.*Tablet)|Tab/i.test(navigator.userAgent);
    }

    determinePerformanceMode() {
        // Simple performance detection
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        
        if (!gl) return 'low';
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (!debugInfo) return 'medium';
        
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        
        if (renderer.includes('Adreno')) {
            return this.isMobile ? 'medium' : 'high';
        } else if (renderer.includes('Mali')) {
            return this.isMobile ? 'low' : 'medium';
        } else if (renderer.includes('Apple')) {
            return 'high';
        }
        
        return this.isMobile ? 'low' : 'medium';
    }

    // Mobile Optimizations
    enableMobileOptimizations() {
        console.log('JARVIS: Enabling mobile optimizations');
        
        // Add mobile-specific CSS classes
        document.body.classList.add('mobile-device');
        
        if (this.isMobile) {
            document.body.classList.add('phone-device');
        }
        
        if (this.isTablet) {
            document.body.classList.add('tablet-device');
        }
        
        // Optimize animations for mobile
        this.optimizeAnimations();
        
        // Enable touch-friendly interactions
        this.enableTouchInteractions();
    }

    optimizeAnimations() {
        // Reduce animation complexity on mobile
        if (this.performanceMode === 'low') {
            document.body.classList.add('reduced-animations');
            
            // Disable heavy particle effects
            if (window.animationEngine) {
                window.animationEngine.setPerformanceMode('low');
            }
        }
    }

    enableTouchInteractions() {
        // Add touch-friendly tap targets
        const buttons = document.querySelectorAll('.control-btn');
        buttons.forEach(button => {
            button.classList.add('touch-optimized');
            button.style.minHeight = '44px';
            button.style.minWidth = '44px';
        });
    }

    // Touch Controls Setup
    setupTouchControls() {
        if (!this.isMobile && !this.isTablet) return;

        // Optimize touch events
        this.optimizeTouchEvents();
        
        // Add haptic feedback simulation
        this.setupHapticFeedback();
        
        // Optimize scroll performance
        this.optimizeScrolling();
    }

    optimizeTouchEvents() {
        // Use passive event listeners for better performance
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
        
        // Prevent 300ms delay on mobile
        this.preventClickDelay();
    }

    preventClickDelay() {
        // Add CSS to eliminate 300ms delay
        const style = document.createElement('style');
        style.textContent = `
            * {
                touch-action: manipulation;
            }
        `;
        document.head.appendChild(style);
    }

    handleTouchStart(event) {
        const touch = event.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        
        // Provide visual feedback
        this.showTouchFeedback(touch.clientX, touch.clientY);
    }

    handleTouchMove(event) {
        if (!this.touchStartX) return;
        
        const touch = event.touches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;
        
        // Detect gestures
        this.detectGestures(deltaX, deltaY);
    }

    handleTouchEnd(event) {
        // Clean up touch feedback
        this.hideTouchFeedback();
        this.touchStartX = 0;
        this.touchStartY = 0;
    }

    showTouchFeedback(x, y) {
        const feedback = document.createElement('div');
        feedback.className = 'touch-feedback';
        feedback.style.cssText = `
            position: fixed;
            left: ${x - 25}px;
            top: ${y - 25}px;
            width: 50px;
            height: 50px;
            background: rgba(0, 212, 255, 0.3);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            animation: touchRipple 0.3s ease-out;
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 300);
    }

    hideTouchFeedback() {
        const feedback = document.querySelector('.touch-feedback');
        if (feedback) {
            feedback.style.animation = 'fadeOut 0.2s ease-out';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 200);
        }
    }

    // Gesture Recognition
    setupGestureRecognition() {
        if (!this.isMobile && !this.isTablet) return;

        this.gestureHandlers = {
            'swipe-left': this.handleSwipeLeft.bind(this),
            'swipe-right': this.handleSwipeRight.bind(this),
            'swipe-up': this.handleSwipeUp.bind(this),
            'swipe-down': this.handleSwipeDown.bind(this),
            'pinch-in': this.handlePinchIn.bind(this),
            'pinch-out': this.handlePinchOut.bind(this),
            'double-tap': this.handleDoubleTap.bind(this),
            'long-press': this.handleLongPress.bind(this)
        };
    }

    detectGestures(deltaX, deltaY) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        if (absX < this.gestureThreshold && absY < this.gestureThreshold) return;
        
        let gesture = '';
        
        if (absX > absY) {
            // Horizontal gesture
            gesture = deltaX > 0 ? 'swipe-right' : 'swipe-left';
        } else {
            // Vertical gesture
            gesture = deltaY > 0 ? 'swipe-down' : 'swipe-up';
        }
        
        this.triggerGesture(gesture);
    }

    triggerGesture(gesture) {
        const handler = this.gestureHandlers[gesture];
        if (handler) {
            handler();
        }
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('jarvisGesture', {
            detail: { gesture }
        }));
    }

    // Gesture Handlers
    handleSwipeLeft() {
        console.log('JARVIS: Swipe left detected');
        
        // Navigate to next interface or close modal
        if (window.jarvisUI && window.jarvisUI.isModalOpen()) {
            window.jarvisUI.closeAllModals();
        }
    }

    handleSwipeRight() {
        console.log('JARVIS: Swipe right detected');
        
        // Open search interface or previous modal
        if (window.jarvisUI && !window.jarvisUI.isModalOpen()) {
            window.jarvisUI.showSearchInterface();
        }
    }

    handleSwipeUp() {
        console.log('JARVIS: Swipe up detected');
        
        // Open file manager
        if (window.jarvisUI) {
            window.jarvisUI.showFileManager();
        }
    }

    handleSwipeDown() {
        console.log('JARVIS: Swipe down detected');
        
        // Show system info
        if (window.jarvisUI) {
            window.jarvisUI.showSystemInfo();
        }
    }

    handlePinchIn() {
        console.log('JARVIS: Pinch in detected');
        
        // Reduce interface scale or hide controls
        document.body.classList.toggle('compact-mode');
    }

    handlePinchOut() {
        console.log('JARVIS: Pinch out detected');
        
        // Increase interface scale or show more controls
        document.body.classList.remove('compact-mode');
    }

    handleDoubleTap() {
        console.log('JARVIS: Double tap detected');
        
        // Toggle voice recognition
        if (window.speechHandler) {
            if (window.speechHandler.isCurrentlyListening()) {
                window.speechHandler.stopListening();
            } else {
                window.speechHandler.startListening();
            }
        }
    }

    handleLongPress() {
        console.log('JARVIS: Long press detected');
        
        // Show context menu or settings
        this.showContextMenu();
    }

    // Mobile UI Optimization
    optimizeForMobile() {
        this.optimizeLayout();
        this.optimizeTypography();
        this.optimizeControls();
        this.adjustModalPositions();
    }

    optimizeLayout() {
        if (this.isMobile) {
            // Stack controls vertically on mobile
            const controlPanel = document.querySelector('.control-panel');
            if (controlPanel) {
                controlPanel.style.gridTemplateColumns = 'repeat(2, 1fr)';
                controlPanel.style.gap = '15px';
                controlPanel.style.padding = '0 20px';
            }
            
            // Adjust main container
            const mainContainer = document.querySelector('.main-container');
            if (mainContainer) {
                mainContainer.style.padding = '10px';
            }
        }
    }

    optimizeTypography() {
        // Increase font sizes for mobile readability
        const root = document.documentElement;
        root.style.setProperty('--base-font-size', this.isMobile ? '16px' : '14px');
        root.style.setProperty('--button-font-size', this.isMobile ? '16px' : '14px');
    }

    optimizeControls() {
        if (!this.isMobile && !this.isTablet) return;

        // Make buttons larger for touch
        const buttons = document.querySelectorAll('.control-btn');
        buttons.forEach(button => {
            button.style.minHeight = '50px';
            button.style.minWidth = '50px';
            button.style.padding = '15px';
        });
        
        // Optimize text inputs
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.style.fontSize = '16px'; // Prevent zoom on iOS
            input.style.padding = '12px';
        });
    }

    adjustModalPositions() {
        if (this.isMobile) {
            // Adjust modal positions for mobile screens
            const modals = document.querySelectorAll('.search-interface, .file-manager, .system-info');
            modals.forEach(modal => {
                modal.style.width = '90%';
                modal.style.maxWidth = '350px';
                modal.style.top = '50%';
                modal.style.left = '50%';
                modal.style.transform = 'translate(-50%, -50%)';
            });
        }
    }

    // Haptic Feedback
    setupHapticFeedback() {
        if (!('vibrate' in navigator)) return;
        
        this.hapticPatterns = {
            light: [10],
            medium: [20],
            heavy: [30],
            success: [10, 10, 10],
            error: [30, 10, 30]
        };
    }

    triggerHapticFeedback(type = 'light') {
        if ('vibrate' in navigator && this.hapticPatterns[type]) {
            navigator.vibrate(this.hapticPatterns[type]);
        }
    }

    // Battery Optimization
    setupBatteryOptimization() {
        if (!('getBattery' in navigator)) return null;
        
        return navigator.getBattery().then(battery => {
            this.batteryOptimization = {
                level: battery.level,
                charging: battery.charging,
                lowPowerMode: battery.level < 0.2 && !battery.charging
            };
            
            this.adjustForBatteryLevel();
            
            // Listen for battery changes
            battery.addEventListener('levelchange', () => {
                this.batteryOptimization.level = battery.level;
                this.adjustForBatteryLevel();
            });
            
            battery.addEventListener('chargingchange', () => {
                this.batteryOptimization.charging = battery.charging;
                this.adjustForBatteryLevel();
            });
            
            return this.batteryOptimization;
        });
    }

    adjustForBatteryLevel() {
        const { level, charging, lowPowerMode } = this.batteryOptimization;
        
        if (lowPowerMode) {
            // Reduce performance for battery saving
            document.body.classList.add('battery-saver');
            this.enableBatterySaverMode();
        } else if (charging || level > 0.5) {
            // Full performance when charging or good battery
            document.body.classList.remove('battery-saver');
            this.disableBatterySaverMode();
        }
    }

    enableBatterySaverMode() {
        // Reduce animation frequency
        if (window.animationEngine) {
            window.animationEngine.setPerformanceMode('low');
        }
        
        // Reduce particle effects
        const particles = document.querySelectorAll('.particle');
        particles.forEach(particle => {
            particle.style.display = 'none';
        });
        
        // Disable some background processes
        this.optimizeSystemMonitoring();
    }

    disableBatterySaverMode() {
        // Restore full performance
        if (window.animationEngine) {
            window.animationEngine.setPerformanceMode(this.performanceMode);
        }
        
        // Re-enable particles
        const particles = document.querySelectorAll('.particle');
        particles.forEach(particle => {
            particle.style.display = 'block';
        });
    }

    optimizeSystemMonitoring() {
        // Reduce monitoring frequency for battery saving
        if (window.systemMonitor) {
            // Could add methods to reduce monitoring frequency
            console.log('JARVIS: Optimizing system monitoring for battery');
        }
    }

    // Utility Methods
    showContextMenu() {
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.innerHTML = `
            <div class="menu-item" data-action="voice-toggle">Toggle Voice</div>
            <div class="menu-item" data-action="wake-word">Wake Word</div>
            <div class="menu-item" data-action="settings">Settings</div>
            <div class="menu-item" data-action="help">Help</div>
        `;
        
        // Position menu at center of screen
        menu.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #00d4ff;
            border-radius: 12px;
            padding: 20px;
            z-index: 10001;
            backdrop-filter: blur(10px);
        `;
        
        // Add event listeners
        menu.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action) {
                this.handleContextAction(action);
                document.body.removeChild(menu);
            }
        });
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (menu.parentNode) {
                document.body.removeChild(menu);
            }
        }, 3000);
        
        document.body.appendChild(menu);
    }

    handleContextAction(action) {
        this.triggerHapticFeedback('medium');
        
        switch (action) {
            case 'voice-toggle':
                if (window.speechHandler) {
                    if (window.speechHandler.isCurrentlyListening()) {
                        window.speechHandler.stopListening();
                    } else {
                        window.speechHandler.startListening();
                    }
                }
                break;
                
            case 'wake-word':
                if (window.wakeWordDetector) {
                    if (window.wakeWordDetector.isActive()) {
                        window.wakeWordDetector.deactivate();
                    } else {
                        window.wakeWordDetector.activate();
                    }
                }
                break;
                
            case 'settings':
                if (window.jarvisUI) {
                    window.jarvisUI.showNotification('Settings panel would open here', 'info');
                }
                break;
                
            case 'help':
                if (window.jarvisCore) {
                    const helpResponse = window.jarvisCore.showHelp();
                    if (window.speechHandler) {
                        window.speechHandler.speak(helpResponse);
                    }
                }
                break;
        }
    }

    // Performance Monitoring
    monitorPerformance() {
        if (!this.isMobile) return;
        
        // Monitor frame rate
        let lastTime = performance.now();
        let frameCount = 0;
        
        const checkFPS = () => {
            frameCount++;
            const now = performance.now();
            
            if (now - lastTime >= 1000) {
                const fps = Math.round(frameCount * 1000 / (now - lastTime));
                
                if (fps < 30) {
                    console.log('JARVIS: Low FPS detected, reducing quality');
                    this.reduceQuality();
                }
                
                frameCount = 0;
                lastTime = now;
            }
            
            requestAnimationFrame(checkFPS);
        };
        
        requestAnimationFrame(checkFPS);
    }

    reduceQuality() {
        document.body.classList.add('low-quality-mode');
        
        // Reduce animation complexity
        if (window.animationEngine) {
            window.animationEngine.setPerformanceMode('low');
        }
    }

    // Public API
    isMobileDevice() {
        return this.isMobile;
    }

    isTabletDevice() {
        return this.isTablet;
    }

    getPerformanceMode() {
        return this.performanceMode;
    }

    getBatteryOptimization() {
        return this.batteryOptimization;
    }

    setGestureThreshold(threshold) {
        this.gestureThreshold = threshold;
    }

    // Event Integration
    integrateWithOtherSystems() {
        // Integrate with animation engine
        if (window.animationEngine) {
            window.addEventListener('jarvisGesture', (event) => {
                const { gesture } = event.detail;
                window.animationEngine.triggerAnimation('gesture', { gesture });
            });
        }
        
        // Integrate with speech handler
        if (window.speechHandler) {
            window.addEventListener('jarvisGesture', (event) => {
                const { gesture } = event.detail;
                if (gesture === 'double-tap') {
                    this.triggerHapticFeedback('light');
                }
            });
        }
    }

    // Cleanup
    destroy() {
        // Remove event listeners
        document.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('touchend', this.handleTouchEnd);
    }
}

// Add mobile-specific CSS
const style = document.createElement('style');
style.textContent = `
    /* Mobile Touch Feedback */
    @keyframes touchRipple {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(1);
            opacity: 0;
        }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    /* Mobile-specific styles */
    .mobile-device .control-panel {
        gap: 15px;
        padding: 0 20px;
    }
    
    .phone-device .control-panel {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .tablet-device .control-panel {
        grid-template-columns: repeat(3, 1fr);
    }
    
    /* Touch-optimized controls */
    .touch-optimized {
        min-height: 44px;
        min-width: 44px;
        cursor: pointer;
        -webkit-tap-highlight-color: rgba(0, 212, 255, 0.3);
    }
    
    /* Reduced animations for performance */
    .reduced-animations *,
    .battery-saver *,
    .low-quality-mode * {
        animation-duration: 0.2s !important;
        transition-duration: 0.2s !important;
    }
    
    /* Compact mode */
    .compact-mode {
        font-size: 0.9em;
    }
    
    .compact-mode .control-btn {
        padding: 10px;
        font-size: 12px;
    }
    
    /* Context menu */
    .context-menu {
        color: #00d4ff;
        font-family: 'Orbitron', monospace;
        text-align: center;
    }
    
    .menu-item {
        padding: 12px 20px;
        border-bottom: 1px solid rgba(0, 212, 255, 0.2);
        cursor: pointer;
        transition: background 0.2s ease;
    }
    
    .menu-item:last-child {
        border-bottom: none;
    }
    
    .menu-item:hover {
        background: rgba(0, 212, 255, 0.1);
    }
    
    /* Mobile modal adjustments */
    @media (max-width: 768px) {
        .search-interface,
        .file-manager,
        .system-info {
            width: 90% !important;
            max-width: 350px !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
        }
    }
    
    /* High DPI displays */
    @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
        .control-btn {
            border-width: 1px;
        }
    }
`;
document.head.appendChild(style);

// Initialize mobile optimizer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mobileOptimizer = new JarvisMobileOptimizer();
    window.mobileOptimizer.integrateWithOtherSystems();
    window.mobileOptimizer.monitorPerformance();
});
