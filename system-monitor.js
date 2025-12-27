// JARVIS System Monitor
// Real-time system monitoring and performance tracking

class SystemMonitor {
    constructor() {
        this.isMonitoring = false;
        this.updateInterval = null;
        this.metrics = {
            cpu: 0,
            memory: 0,
            network: 'online',
            battery: 100,
            storage: 0,
            uptime: 0
        };
        this.history = {
            cpu: [],
            memory: [],
            battery: []
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSystemInfo();
        this.startMonitoring();
        
        console.log('JARVIS System Monitor initialized');
    }

    setupEventListeners() {
        // Network status monitoring
        window.addEventListener('online', () => {
            this.metrics.network = 'online';
            this.updateNetworkStatus();
            this.logEvent('Network: Online');
        });

        window.addEventListener('offline', () => {
            this.metrics.network = 'offline';
            this.updateNetworkStatus();
            this.logEvent('Network: Offline');
        });

        // Battery API support
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                this.setupBatteryMonitoring(battery);
            });
        }

        // Storage estimation
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            this.updateStorageInfo();
        }

        // Page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseMonitoring();
            } else {
                this.resumeMonitoring();
            }
        });
    }

    loadSystemInfo() {
        // Basic system information
        const systemInfo = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screenResolution: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            colorDepth: screen.colorDepth,
            pixelRatio: window.devicePixelRatio,
            hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
            maxTouchPoints: navigator.maxTouchPoints || 0
        };

        this.updateDetailedSystemInfo(systemInfo);
    }

    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.updateInterval = setInterval(() => {
            this.updateMetrics();
        }, 2000); // Update every 2 seconds

        // Initial update
        this.updateMetrics();
    }

    stopMonitoring() {
        this.isMonitoring = false;
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    pauseMonitoring() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }

    resumeMonitoring() {
        if (this.isMonitoring) {
            this.startMonitoring();
        }
    }

    updateMetrics() {
        this.updateCPUMetrics();
        this.updateMemoryMetrics();
        this.updateNetworkStatus();
        this.updateUptime();
        this.updatePerformanceMetrics();
    }

    updateCPUMetrics() {
        // Simulate CPU usage (in real implementation, would use Performance API)
        const cpuUsage = this.simulateCPULoad();
        this.metrics.cpu = cpuUsage;
        
        // Keep history for graphs
        this.history.cpu.push(cpuUsage);
        if (this.history.cpu.length > 50) {
            this.history.cpu.shift();
        }

        this.updateCPUDisplay();
    }

    simulateCPULoad() {
        // Simple CPU simulation based on time and random factors
        const baseLoad = 15;
        const timeVariation = Math.sin(Date.now() / 10000) * 10;
        const randomVariation = Math.random() * 20;
        return Math.max(0, Math.min(100, baseLoad + timeVariation + randomVariation));
    }

    updateMemoryMetrics() {
        // Simulate memory usage
        const memoryUsage = this.simulateMemoryUsage();
        this.metrics.memory = memoryUsage;
        
        // Keep history
        this.history.memory.push(memoryUsage);
        if (this.history.memory.length > 50) {
            this.history.memory.shift();
        }

        this.updateMemoryDisplay();
    }

    simulateMemoryUsage() {
        // Simulate memory usage based on time and activity
        const baseUsage = 40;
        const activityVariation = Math.cos(Date.now() / 15000) * 15;
        const randomVariation = Math.random() * 25;
        return Math.max(20, Math.min(90, baseUsage + activityVariation + randomVariation));
    }

    updateNetworkStatus() {
        const networkElement = document.getElementById('networkStatus');
        if (networkElement) {
            const status = navigator.onLine ? 'Online' : 'Offline';
            this.metrics.network = status.toLowerCase();
            networkElement.textContent = status;
            networkElement.style.color = navigator.onLine ? '#00ff00' : '#ff4444';
        }
    }

    updateUptime() {
        const uptime = Date.now() - (performance.timeOrigin || Date.now());
        this.metrics.uptime = Math.floor(uptime / 1000);
    }

    updatePerformanceMetrics() {
        // Performance API metrics
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                this.metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
                this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
            }

            // Memory performance (if available)
            if ('memory' in performance) {
                const memInfo = performance.memory;
                this.metrics.usedJSHeapSize = Math.round(memInfo.usedJSHeapSize / 1048576); // MB
                this.metrics.totalJSHeapSize = Math.round(memInfo.totalJSHeapSize / 1048576); // MB
            }
        }
    }

    setupBatteryMonitoring(battery) {
        const updateBattery = () => {
            this.metrics.battery = Math.round(battery.level * 100);
            this.updateBatteryDisplay();
            
            if (battery.charging) {
                this.metrics.batteryStatus = 'Charging';
            } else {
                this.metrics.batteryStatus = 'Discharging';
            }
        };

        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
        
        updateBattery();
    }

    async updateStorageInfo() {
        try {
            const estimate = await navigator.storage.estimate();
            const used = Math.round((estimate.usage / estimate.quota) * 100);
            this.metrics.storage = used;
            this.updateStorageDisplay();
        } catch (error) {
            console.warn('Storage estimation not available:', error);
        }
    }

    updateCPUDisplay() {
        const cpuElement = document.getElementById('cpuUsage');
        if (cpuElement) {
            cpuElement.textContent = Math.round(this.metrics.cpu) + '%';
            
            // Color coding based on usage
            if (this.metrics.cpu > 80) {
                cpuElement.style.color = '#ff4444'; // Red
            } else if (this.metrics.cpu > 60) {
                cpuElement.style.color = '#ffaa00'; // Orange
            } else {
                cpuElement.style.color = '#00ff00'; // Green
            }
        }
    }

    updateMemoryDisplay() {
        const memoryElement = document.getElementById('memoryUsage');
        if (memoryElement) {
            memoryElement.textContent = Math.round(this.metrics.memory) + '%';
            
            // Color coding based on usage
            if (this.metrics.memory > 85) {
                memoryElement.style.color = '#ff4444'; // Red
            } else if (this.metrics.memory > 70) {
                memoryElement.style.color = '#ffaa00'; // Orange
            } else {
                memoryElement.style.color = '#00ff00'; // Green
            }
        }
    }

    updateBatteryDisplay() {
        // Update battery display if it exists in the UI
        const batteryElement = document.querySelector('.metric[data-type="battery"] .metric-value');
        if (batteryElement) {
            batteryElement.textContent = this.metrics.battery + '%';
            
            // Color coding
            if (this.metrics.battery < 20) {
                batteryElement.style.color = '#ff4444';
            } else if (this.metrics.battery < 50) {
                batteryElement.style.color = '#ffaa00';
            } else {
                batteryElement.style.color = '#00ff00';
            }
        }
    }

    updateStorageDisplay() {
        // Update storage display if it exists
        const storageElement = document.querySelector('.metric[data-type="storage"] .metric-value');
        if (storageElement) {
            storageElement.textContent = this.metrics.storage + '%';
        }
    }

    updateDetailedSystemInfo(systemInfo) {
        // Update detailed system info display
        const elements = {
            'userInfo': systemInfo.platform,
            'browserInfo': `${systemInfo.userAgent.split(' ')[0]} • ${systemInfo.language}`,
            'screenInfo': `${systemInfo.screenResolution} • ${systemInfo.pixelRatio}x`
        };

        Object.entries(elements).forEach(([id, content]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = content;
            }
        });
    }

    // System Commands
    runSystemDiagnostics() {
        const diagnostics = {
            timestamp: new Date().toISOString(),
            browser: navigator.userAgent,
            platform: navigator.platform,
            screen: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            online: navigator.onLine,
            cookies: navigator.cookieEnabled,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            metrics: this.metrics,
            performance: this.getPerformanceMetrics()
        };

        return diagnostics;
    }

    getPerformanceMetrics() {
        const metrics = {};
        
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                metrics.pageLoad = navigation.loadEventEnd - navigation.loadEventStart;
                metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
                metrics.domInteractive = navigation.domInteractive - navigation.navigationStart;
            }

            // Memory metrics if available
            if ('memory' in performance) {
                metrics.usedJSHeapSize = performance.memory.usedJSHeapSize;
                metrics.totalJSHeapSize = performance.memory.totalJSHeapSize;
                metrics.jsHeapSizeLimit = performance.memory.jsHeapSizeLimit;
            }
        }

        return metrics;
    }

    generateSystemReport() {
        const report = {
            systemHealth: this.assessSystemHealth(),
            performance: this.getPerformanceMetrics(),
            recommendations: this.getRecommendations(),
            uptime: this.metrics.uptime,
            lastUpdated: new Date().toISOString()
        };

        return report;
    }

    assessSystemHealth() {
        const health = {
            overall: 'Good',
            issues: [],
            score: 100
        };

        // Check CPU usage
        if (this.metrics.cpu > 80) {
            health.issues.push('High CPU usage detected');
            health.score -= 20;
        }

        // Check memory usage
        if (this.metrics.memory > 85) {
            health.issues.push('High memory usage detected');
            health.score -= 20;
        }

        // Check network status
        if (!navigator.onLine) {
            health.issues.push('No network connection');
            health.score -= 30;
        }

        // Check battery (if available)
        if (this.metrics.battery && this.metrics.battery < 15) {
            health.issues.push('Low battery level');
            health.score -= 10;
        }

        // Determine overall health
        if (health.score >= 80) {
            health.overall = 'Excellent';
        } else if (health.score >= 60) {
            health.overall = 'Good';
        } else if (health.score >= 40) {
            health.overall = 'Fair';
        } else {
            health.overall = 'Poor';
        }

        return health;
    }

    getRecommendations() {
        const recommendations = [];

        if (this.metrics.cpu > 70) {
            recommendations.push('Consider closing unnecessary applications to reduce CPU usage');
        }

        if (this.metrics.memory > 75) {
            recommendations.push('Close unused browser tabs to free up memory');
        }

        if (!navigator.onLine) {
            recommendations.push('Check your internet connection for online features');
        }

        if (this.metrics.battery && this.metrics.battery < 20) {
            recommendations.push('Connect to power source to maintain optimal performance');
        }

        if (recommendations.length === 0) {
            recommendations.push('System performance is optimal');
        }

        return recommendations;
    }

    // Event Logging
    logEvent(event, details = '') {
        const logEntry = {
            timestamp: new Date(),
            event: event,
            details: details,
            metrics: { ...this.metrics }
        };

        // Store in localStorage
        const eventLog = JSON.parse(localStorage.getItem('jarvisEventLog') || '[]');
        eventLog.push(logEntry);
        
        // Keep only last 100 entries
        if (eventLog.length > 100) {
            eventLog.splice(0, eventLog.length - 100);
        }
        
        localStorage.setItem('jarvisEventLog', JSON.stringify(eventLog));
    }

    getEventLog() {
        return JSON.parse(localStorage.getItem('jarvisEventLog') || '[]');
    }

    clearEventLog() {
        localStorage.removeItem('jarvisEventLog');
    }

    // Public API
    getCurrentMetrics() {
        return { ...this.metrics };
    }

    getMetricsHistory() {
        return { ...this.history };
    }

    exportSystemData() {
        const data = {
            metrics: this.getCurrentMetrics(),
            history: this.getMetricsHistory(),
            diagnostics: this.runSystemDiagnostics(),
            report: this.generateSystemReport(),
            eventLog: this.getEventLog(),
            exportedAt: new Date().toISOString()
        };

        return data;
    }

    startDeepMonitoring() {
        // Enhanced monitoring with more frequent updates
        this.stopMonitoring();
        this.updateInterval = setInterval(() => {
            this.updateMetrics();
            this.logPerformanceSpikes();
        }, 500); // Update every 500ms
        
        this.isMonitoring = true;
    }

    logPerformanceSpikes() {
        // Log performance spikes
        if (this.metrics.cpu > 90 || this.metrics.memory > 90) {
            this.logEvent('Performance Spike', `CPU: ${this.metrics.cpu}%, Memory: ${this.metrics.memory}%`);
        }
    }

    // Cleanup
    destroy() {
        this.stopMonitoring();
        // Clean up event listeners if needed
    }
}

// Initialize system monitor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.systemMonitor = new SystemMonitor();
});
