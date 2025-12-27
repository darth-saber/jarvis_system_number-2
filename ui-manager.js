// JARVIS UI Manager
// Handles all user interface interactions and animations

class JarvisUI {
    constructor() {
        this.isSearchOpen = false;
        this.isFileManagerOpen = false;
        this.isSystemInfoOpen = false;
        this.activeAnimations = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeAnimations();
        this.setupKeyboardShortcuts();
        this.loadSettings();
        
        console.log('JARVIS UI Manager initialized');
    }

    setupEventListeners() {
        // Search interface
        const searchBtn = document.getElementById('searchBtn');
        const searchInterface = document.getElementById('searchInterface');
        const searchInput = document.getElementById('searchInput');
        const searchExecute = document.getElementById('searchExecute');
        const searchClose = document.getElementById('searchClose');

        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.toggleSearchInterface());
        }

        if (searchExecute) {
            searchExecute.addEventListener('click', () => this.executeSearch());
        }

        if (searchClose) {
            searchClose.addEventListener('click', () => this.hideSearchInterface());
        }

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.executeSearch();
                }
            });
        }

        // File Manager
        const fileBtn = document.getElementById('fileBtn');
        const fileManager = document.getElementById('fileManager');
        const fileManagerClose = document.getElementById('fileManagerClose');

        if (fileBtn) {
            fileBtn.addEventListener('click', () => this.showFileManager());
        }

        if (fileManagerClose) {
            fileManagerClose.addEventListener('click', () => this.hideFileManager());
        }

        // System Info
        const systemBtn = document.getElementById('systemBtn');
        const systemInfo = document.getElementById('systemInfo');
        const systemInfoClose = document.getElementById('systemInfoClose');

        if (systemBtn) {
            systemBtn.addEventListener('click', () => this.showSystemInfo());
        }

        if (systemInfoClose) {
            systemInfoClose.addEventListener('click', () => this.hideSystemInfo());
        }

        // Code Generator
        const codeGenerationBtn = document.getElementById('codeGenerationBtn');

        if (codeGenerationBtn) {
            codeGenerationBtn.addEventListener('click', () => this.showCodeGenerationModal());
        }

        // Global click handlers
        document.addEventListener('click', (e) => {
            this.handleGlobalClick(e);
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Escape key closes all modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }

            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.toggleSearchInterface();
            }

            // Ctrl/Cmd + G for code generation
            if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
                e.preventDefault();
                this.showCodeGenerationModal();
            }

            // Ctrl/Cmd + F for file manager
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                this.showFileManager();
            }

            // Ctrl/Cmd + I for system info
            if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                e.preventDefault();
                this.showSystemInfo();
            }

            // Ctrl/Cmd + S for voice command
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.triggerVoiceCommand();
            }
        });
    }

    // Search Interface
    toggleSearchInterface() {
        if (this.isSearchOpen) {
            this.hideSearchInterface();
        } else {
            this.showSearchInterface();
        }
    }

    showSearchInterface() {
        const searchInterface = document.getElementById('searchInterface');
        if (searchInterface) {
            searchInterface.style.display = 'flex';
            this.isSearchOpen = true;
            
            // Focus on input
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                setTimeout(() => searchInput.focus(), 100);
            }

            // Add animation
            this.animateElement(searchInterface, 'fadeInScale');
            
            // Close other modals
            this.hideFileManager();
            this.hideSystemInfo();
        }
    }

    hideSearchInterface() {
        const searchInterface = document.getElementById('searchInterface');
        if (searchInterface) {
            this.animateElement(searchInterface, 'fadeOutScale', () => {
                searchInterface.style.display = 'none';
            });
            this.isSearchOpen = false;
            
            // Clear search input
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = '';
            }
        }
    }

    executeSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput && searchInput.value.trim()) {
            const query = searchInput.value.trim();
            
            // Process search through JARVIS core
            if (window.jarvisCore) {
                const response = window.jarvisCore.processCommand(`search for ${query}`);
                
                // Open search in browser
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                window.open(searchUrl, '_blank');
                
                // Provide feedback
                if (window.speechHandler) {
                    window.speechHandler.speak(response);
                }
            }
            
            this.hideSearchInterface();
        }
    }

    // File Manager
    showFileManager() {
        const fileManager = document.getElementById('fileManager');
        if (fileManager) {
            fileManager.style.display = 'block';
            this.isFileManagerOpen = true;
            
            // Load file system
            this.loadFileSystem();
            
            // Add animation
            this.animateElement(fileManager, 'slideInUp');
            
            // Close other modals
            this.hideSearchInterface();
            this.hideSystemInfo();
        }
    }

    hideFileManager() {
        const fileManager = document.getElementById('fileManager');
        if (fileManager) {
            this.animateElement(fileManager, 'slideOutDown', () => {
                fileManager.style.display = 'none';
            });
            this.isFileManagerOpen = false;
        }
    }

    loadFileSystem() {
        const fileTree = document.getElementById('fileTree');
        if (!fileTree) return;

        // Simulate file system structure
        const fileSystem = {
            'Home': {
                type: 'folder',
                children: {
                    'Documents': {
                        type: 'folder',
                        children: {
                            'resume.pdf': { type: 'file', size: '2.1 MB' },
                            'project-notes.txt': { type: 'file', size: '45 KB' }
                        }
                    },
                    'Pictures': {
                        type: 'folder',
                        children: {
                            'vacation-2024.jpg': { type: 'file', size: '3.2 MB' },
                            'profile-pic.png': { type: 'file', size: '1.1 MB' }
                        }
                    },
                    'Music': {
                        type: 'folder',
                        children: {
                            'favorite-song.mp3': { type: 'file', size: '4.8 MB' },
                            'playlist.m3u': { type: 'file', size: '12 KB' }
                        }
                    }
                }
            },
            'Downloads': {
                type: 'folder',
                children: {
                    'installer.dmg': { type: 'file', size: '156 MB' },
                    'document.pdf': { type: 'file', size: '2.3 MB' }
                }
            }
        };

        fileTree.innerHTML = this.renderFileTree(fileSystem);
    }

    renderFileTree(files, path = '') {
        let html = '';
        
        for (const [name, item] of Object.entries(files)) {
            const fullPath = path ? `${path}/${name}` : name;
            
            if (item.type === 'folder') {
                html += `<div class="file-item folder" data-path="${fullPath}">
                    <span class="file-icon">📁</span>
                    <span class="file-name">${name}</span>
                    <span class="file-type">Folder</span>
                </div>`;
                
                if (item.children) {
                    html += `<div class="folder-content" style="margin-left: 20px;">
                        ${this.renderFileTree(item.children, fullPath)}
                    </div>`;
                }
            } else {
                html += `<div class="file-item file" data-path="${fullPath}">
                    <span class="file-icon">📄</span>
                    <span class="file-name">${name}</span>
                    <span class="file-size">${item.size || 'Unknown'}</span>
                </div>`;
            }
        }
        
        return html;
    }

    // System Info
    showSystemInfo() {
        const systemInfo = document.getElementById('systemInfo');
        if (systemInfo) {
            systemInfo.style.display = 'block';
            this.isSystemInfoOpen = true;
            
            // Update system info
            this.updateSystemInfo();
            
            // Add animation
            this.animateElement(systemInfo, 'slideInUp');
            
            // Close other modals
            this.hideSearchInterface();
            this.hideFileManager();
            this.hideCodeGenerationModal();
        }
    }

    hideSystemInfo() {
        const systemInfo = document.getElementById('systemInfo');
        if (systemInfo) {
            this.animateElement(systemInfo, 'slideOutDown', () => {
                systemInfo.style.display = 'none';
            });
            this.isSystemInfoOpen = false;
        }
    }

    // Code Generation Modal
    showCodeGenerationModal() {
        if (window.codeGenerator && typeof window.codeGenerator.showCodeGenerationModal === 'function') {
            window.codeGenerator.showCodeGenerationModal();
            
            // Close other modals
            this.hideSearchInterface();
            this.hideFileManager();
            this.hideSystemInfo();
        } else {
            this.showNotification('Code Generator is not available', 'error');
        }
    }

    hideCodeGenerationModal() {
        const codeGenerationModal = document.querySelector('.code-generation-modal');
        if (codeGenerationModal) {
            codeGenerationModal.remove();
        }
    }

    updateSystemInfo() {
        const userInfo = document.getElementById('userInfo');
        const browserInfo = document.getElementById('browserInfo');
        const screenInfo = document.getElementById('screenInfo');

        if (userInfo) {
            userInfo.textContent = 'JARVIS User • Online';
        }

        if (browserInfo) {
            browserInfo.textContent = `${navigator.userAgent.split(' ')[0]} • ${navigator.language}`;
        }

        if (screenInfo) {
            screenInfo.textContent = `${screen.width} × ${screen.height} • ${window.devicePixelRatio}x`;
        }
    }

    // Voice Command Trigger
    triggerVoiceCommand() {
        const voiceBtn = document.getElementById('voiceBtn');
        if (voiceBtn) {
            voiceBtn.click();
        }
    }

    // Global Click Handler
    handleGlobalClick(e) {
        // Close modals when clicking outside
        const searchInterface = document.getElementById('searchInterface');
        const fileManager = document.getElementById('fileManager');
        const systemInfo = document.getElementById('systemInfo');
        const codeGenerationModal = document.querySelector('.code-generation-modal');
        const codePreviewModal = document.querySelector('.code-preview-modal');
        const fileListModal = document.querySelector('.file-list-modal');

        if (this.isSearchOpen && !searchInterface.contains(e.target)) {
            this.hideSearchInterface();
        }

        if (this.isFileManagerOpen && !fileManager.contains(e.target)) {
            this.hideFileManager();
        }

        if (this.isSystemInfoOpen && !systemInfo.contains(e.target)) {
            this.hideSystemInfo();
        }

        // Close code generation modals when clicking outside
        if (codeGenerationModal && !codeGenerationModal.contains(e.target)) {
            codeGenerationModal.remove();
        }

        if (codePreviewModal && !codePreviewModal.contains(e.target)) {
            codePreviewModal.remove();
        }

        if (fileListModal && !fileListModal.contains(e.target)) {
            fileListModal.remove();
        }
    }

    // Animation System
    initializeAnimations() {
        // Add CSS animation classes
        const style = document.createElement('style');
        style.textContent = `
            .fadeInScale {
                animation: fadeInScale 0.3s ease-out;
            }
            
            .fadeOutScale {
                animation: fadeOutScale 0.3s ease-in;
            }
            
            .slideInUp {
                animation: slideInUp 0.4s ease-out;
            }
            
            .slideOutDown {
                animation: slideOutDown 0.4s ease-in;
            }
            
            @keyframes fadeInScale {
                from {
                    opacity: 0;
                    transform: scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            @keyframes fadeOutScale {
                from {
                    opacity: 1;
                    transform: scale(1);
                }
                to {
                    opacity: 0;
                    transform: scale(0.9);
                }
            }
            
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(50px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes slideOutDown {
                from {
                    opacity: 1;
                    transform: translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateY(50px);
                }
            }
            
            .control-btn.listening {
                background: rgba(255, 0, 0, 0.2) !important;
                border-color: #ff4444 !important;
                box-shadow: 0 0 20px rgba(255, 68, 68, 0.4) !important;
            }
            
            .speech-indicator.listening .microphone-icon {
                animation: pulse 1s infinite;
            }
            
            .speech-indicator.speaking .microphone-icon {
                color: #00ff00;
            }
        `;
        document.head.appendChild(style);
    }

    animateElement(element, animationClass, callback) {
        if (element) {
            element.classList.add(animationClass);
            
            if (callback) {
                element.addEventListener('animationend', function() {
                    callback();
                }, { once: true });
            }
        }
    }

    // Utility Methods
    closeAllModals() {
        this.hideSearchInterface();
        this.hideFileManager();
        this.hideSystemInfo();
        this.hideCodeGenerationModal();
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            background: type === 'error' ? 'rgba(255, 68, 68, 0.9)' : 'rgba(0, 212, 255, 0.9)',
            color: '#ffffff',
            borderRadius: '8px',
            zIndex: '10000',
            fontSize: '14px',
            fontFamily: 'Orbitron, monospace',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Settings Management
    loadSettings() {
        const settings = localStorage.getItem('jarvisUISettings');
        if (settings) {
            try {
                const parsed = JSON.parse(settings);
                // Apply saved settings
                this.applySettings(parsed);
            } catch (e) {
                console.warn('Failed to load JARVIS UI settings');
            }
        }
    }

    saveSettings() {
        const settings = {
            theme: 'dark',
            animationsEnabled: true,
            soundEnabled: true
        };
        
        localStorage.setItem('jarvisUISettings', JSON.stringify(settings));
    }

    applySettings(settings) {
        // Apply theme
        if (settings.theme === 'dark') {
            document.body.classList.add('dark-theme');
        }
        
        // Enable/disable animations
        if (!settings.animationsEnabled) {
            document.body.classList.add('no-animations');
        }
    }

    // Public API
    isModalOpen() {
        return this.isSearchOpen || this.isFileManagerOpen || this.isSystemInfoOpen;
    }

    getOpenModal() {
        if (this.isSearchOpen) return 'search';
        if (this.isFileManagerOpen) return 'fileManager';
        if (this.isSystemInfoOpen) return 'systemInfo';
        return null;
    }
}

// Initialize UI manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.jarvisUI = new JarvisUI();
});
