// JARVIS Code Generator Frontend
// Voice-controlled code file generation

class CodeGenerator {
    constructor() {
        this.isModalOpen = false;
        this.currentCode = '';
        this.currentFileName = '';
        this.generatedFiles = [];
        
        this.init();
    }

    init() {
        console.log('JARVIS Code Generator initializing...');
        this.setupEventListeners();
        this.loadTemplates();
        console.log('JARVIS Code Generator ready');
    }

    setupEventListeners() {
        // Listen for voice commands related to coding
        window.addEventListener('jarvisVoiceCommand', (event) => {
            this.handleVoiceCommand(event.detail);
        });

        // Listen for code generation requests from other components
        window.addEventListener('requestCodeGeneration', (event) => {
            this.generateCode(event.detail);
        });
    }

    handleVoiceCommand(commandDetail) {
        const command = commandDetail.command.toLowerCase();
        
        if (this.isCodeRelatedCommand(command)) {
            this.showCodeGenerationModal();
            
            // Provide immediate feedback
            if (window.speechHandler) {
                window.speechHandler.speak("Opening code generation interface. What would you like me to create?");
            }
        }
    }

    isCodeRelatedCommand(command) {
        const codeKeywords = [
            'create', 'build', 'generate', 'make', 'write', 'code',
            'python', 'javascript', 'html', 'css', 'react', 'node',
            'function', 'script', 'component', 'app', 'website',
            'database', 'api', 'web page', 'react component'
        ];
        
        return codeKeywords.some(keyword => command.includes(keyword));
    }

    showCodeGenerationModal() {
        if (this.isModalOpen) return;
        
        const modal = this.createCodeGenerationModal();
        document.body.appendChild(modal);
        this.isModalOpen = true;
        
        // Animate in
        setTimeout(() => {
            modal.classList.add('modal-visible');
        }, 10);
        
        // Focus on input
        const input = modal.querySelector('.code-request-input');
        if (input) {
            setTimeout(() => input.focus(), 100);
        }
    }

    createCodeGenerationModal() {
        const modal = document.createElement('div');
        modal.className = 'code-generation-modal modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🤖 Code Generation</h3>
                    <button class="modal-close" onclick="window.codeGenerator.closeModal()">✕</button>
                </div>
                
                <div class="modal-body">
                    <div class="code-request-section">
                        <label for="codeRequestInput">What would you like me to code?</label>
                        <textarea 
                            id="codeRequestInput" 
                            class="code-request-input"
                            placeholder="e.g., Create a Python function to analyze CSV data, Build a React component for a login form, Generate HTML for a portfolio page..."
                            rows="3"
                        ></textarea>
                        
                        <div class="template-selector">
                            <label for="templateSelect">Quick Templates:</label>
                            <select id="templateSelect" class="template-select">
                                <option value="">Choose a template...</option>
                                <option value="python-script">Python Script</option>
                                <option value="javascript-function">JavaScript Function</option>
                                <option value="html-page">HTML Page</option>
                                <option value="css-styles">CSS Styles</option>
                                <option value="react-component">React Component</option>
                                <option value="node-api">Node.js API</option>
                                <option value="sql-query">SQL Query</option>
                                <option value="config-file">Config File</option>
                            </select>
                        </div>
                        
                        <div class="generation-options">
                            <label>
                                <input type="checkbox" id="addComments" checked> Add comments
                            </label>
                            <label>
                                <input type="checkbox" id="addErrorHandling" checked> Add error handling
                            </label>
                            <label>
                                <input type="checkbox" id="optimizeCode" checked> Optimize code
                            </label>
                        </div>
                        
                        <button class="generate-code-btn" onclick="window.codeGenerator.generateCode()">
                            🎯 Generate Code
                        </button>
                    </div>
                    
                    <div class="code-preview-section" style="display: none;">
                        <div class="code-preview-header">
                            <span class="file-name" id="previewFileName">Generated Code</span>
                            <div class="code-actions">
                                <button class="action-btn" onclick="window.codeGenerator.copyCode()">📋 Copy</button>
                                <button class="action-btn" onclick="window.codeGenerator.downloadCode()">💾 Download</button>
                                <button class="action-btn" onclick="window.codeGenerator.saveToFiles()">📁 Save</button>
                                <button class="action-btn" onclick="window.codeGenerator.modifyCode()">✏️ Modify</button>
                            </div>
                        </div>
                        <pre class="code-preview" id="codePreview"></pre>
                    </div>
                </div>
            </div>
        `;

        // Add template selector event listener
        const templateSelect = modal.querySelector('#templateSelect');
        templateSelect.addEventListener('change', (e) => {
            this.loadTemplate(e.target.value);
        });

        // Add Enter key handler
        const requestInput = modal.querySelector('#codeRequestInput');
        requestInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.generateCode();
            }
        });

        return modal;
    }

    async generateCode() {
        const requestInput = document.getElementById('codeRequestInput');
        const templateSelect = document.getElementById('templateSelect');
        
        if (!requestInput) return;
        
        const request = requestInput.value.trim();
        const template = templateSelect.value;
        
        if (!request && !template) {
            this.showNotification('Please provide a request or select a template', 'error');
            return;
        }
        
        // Show loading state
        this.showGenerationProgress();
        
        try {
            const requestData = {
                request: request || this.getTemplateRequest(template),
                template: template,
                options: {
                    addComments: document.getElementById('addComments')?.checked ?? true,
                    addErrorHandling: document.getElementById('addErrorHandling')?.checked ?? true,
                    optimizeCode: document.getElementById('optimizeCode')?.checked ?? true
                }
            };
            
            const response = await fetch('http://localhost:5001/api/generate-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                this.displayGeneratedCode(result);
                this.showNotification('Code generated successfully!', 'success');
                
                // Provide voice feedback
                if (window.speechHandler) {
                    window.speechHandler.speak(`I've generated ${result.file_name} for you. The code is ready to use.`);
                }
            } else {
                throw new Error(result.error || 'Code generation failed');
            }
            
        } catch (error) {
            console.error('Code generation error:', error);
            this.showNotification('Failed to generate code. Please try again.', 'error');
            
            // Provide voice feedback
            if (window.speechHandler) {
                window.speechHandler.speak('I encountered an error generating the code. Please try again.');
            }
        } finally {
            this.hideGenerationProgress();
        }
    }

    getTemplateRequest(template) {
        const templateRequests = {
            'python-script': 'Create a Python script with basic structure and error handling',
            'javascript-function': 'Create a JavaScript function with proper syntax and comments',
            'html-page': 'Create a complete HTML page with proper structure',
            'css-styles': 'Create CSS styles with modern properties and responsive design',
            'react-component': 'Create a React functional component with hooks',
            'node-api': 'Create a Node.js API endpoint with Express',
            'sql-query': 'Create a SQL query for database operations',
            'config-file': 'Create a configuration file (JSON format)'
        };
        
        return templateRequests[template] || 'Create a simple code file';
    }

    loadTemplate(template) {
        const requestInput = document.getElementById('codeRequestInput');
        if (requestInput) {
            requestInput.value = this.getTemplateRequest(template);
        }
    }

    displayGeneratedCode(result) {
        this.currentCode = result.code;
        this.currentFileName = result.file_name;
        
        // Show preview section
        const previewSection = document.querySelector('.code-preview-section');
        const previewFileName = document.getElementById('previewFileName');
        const codePreview = document.getElementById('codePreview');
        
        if (previewSection && previewFileName && codePreview) {
            previewSection.style.display = 'block';
            previewFileName.textContent = result.file_name;
            codePreview.textContent = result.code;
            codePreview.className = `code-preview ${this.getLanguageClass(result.language)}`;
        }
        
        // Add to generated files list
        this.generatedFiles.push({
            name: result.file_name,
            code: result.code,
            language: result.language,
            timestamp: new Date().toISOString()
        });
    }

    getLanguageClass(language) {
        const languageClasses = {
            'python': 'language-python',
            'javascript': 'language-javascript',
            'html': 'language-html',
            'css': 'language-css',
            'json': 'language-json',
            'sql': 'language-sql'
        };
        
        return languageClasses[language.toLowerCase()] || 'language-plaintext';
    }

    copyCode() {
        if (navigator.clipboard && this.currentCode) {
            navigator.clipboard.writeText(this.currentCode).then(() => {
                this.showNotification('Code copied to clipboard!', 'success');
            }).catch(() => {
                this.fallbackCopyToClipboard();
            });
        } else {
            this.fallbackCopyToClipboard();
        }
    }

    fallbackCopyToClipboard() {
        const textArea = document.createElement('textarea');
        textArea.value = this.currentCode;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showNotification('Code copied to clipboard!', 'success');
        } catch (err) {
            this.showNotification('Failed to copy code', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    downloadCode() {
        if (!this.currentCode) return;
        
        const blob = new Blob([this.currentCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.currentFileName || 'generated-code.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Code downloaded successfully!', 'success');
    }

    saveToFiles() {
        if (!this.currentCode) return;
        
        // Add to file manager if available
        if (window.jarvisUI && window.jarvisUI.saveGeneratedFile) {
            window.jarvisUI.saveGeneratedFile(this.currentFileName, this.currentCode);
        }
        
        this.showNotification('Code saved to files!', 'success');
    }

    modifyCode() {
        const requestInput = document.getElementById('codeRequestInput');
        if (requestInput) {
            requestInput.value = `Modify the current code: ${this.currentFileName}. Make improvements or add features.`;
            requestInput.focus();
        }
    }

    showGenerationProgress() {
        const modal = document.querySelector('.code-generation-modal');
        const generateBtn = modal?.querySelector('.generate-code-btn');
        
        if (generateBtn) {
            generateBtn.textContent = '⏳ Generating...';
            generateBtn.disabled = true;
        }
        
        // Add progress indicator
        const progressDiv = document.createElement('div');
        progressDiv.className = 'generation-progress';
        progressDiv.innerHTML = `
            <div class="progress-text">Analyzing request and generating code...</div>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        `;
        
        const modalBody = modal?.querySelector('.modal-body');
        if (modalBody) {
            modalBody.appendChild(progressDiv);
        }
    }

    hideGenerationProgress() {
        const progressDiv = document.querySelector('.generation-progress');
        const modal = document.querySelector('.code-generation-modal');
        const generateBtn = modal?.querySelector('.generate-code-btn');
        
        if (progressDiv) {
            progressDiv.remove();
        }
        
        if (generateBtn) {
            generateBtn.textContent = '🎯 Generate Code';
            generateBtn.disabled = false;
        }
    }

    closeModal() {
        const modal = document.querySelector('.code-generation-modal');
        if (modal) {
            modal.classList.remove('modal-visible');
            setTimeout(() => {
                modal.remove();
                this.isModalOpen = false;
                this.currentCode = '';
                this.currentFileName = '';
            }, 300);
        }
    }

    showNotification(message, type = 'info') {
        if (window.jarvisUI && window.jarvisUI.showNotification) {
            window.jarvisUI.showNotification(message, type);
        } else {
            console.log(`JARVIS Notification [${type}]: ${message}`);
        }
    }

    loadTemplates() {
        // Pre-load common templates
        this.templates = {
            'python-data-analysis': {
                name: 'Python Data Analysis Script',
                description: 'Complete data analysis with pandas and matplotlib',
                language: 'python'
            },
            'react-component': {
                name: 'React Functional Component',
                description: 'Modern React component with hooks',
                language: 'javascript'
            },
            'html-landing-page': {
                name: 'HTML Landing Page',
                description: 'Responsive landing page template',
                language: 'html'
            },
            'css-styles': {
                name: 'CSS Styles',
                description: 'Modern CSS with animations',
                language: 'css'
            }
        };
    }

    // Public API
    getGeneratedFiles() {
        return this.generatedFiles;
    }

    clearHistory() {
        this.generatedFiles = [];
        this.showNotification('Code generation history cleared', 'info');
    }

    getCodeQuality() {
        if (!this.currentCode) return null;
        
        // Simple code quality metrics
        const lines = this.currentCode.split('\n').filter(line => line.trim());
        const hasComments = this.currentCode.includes('#') || this.currentCode.includes('//') || this.currentCode.includes('/*');
        const hasErrorHandling = this.currentCode.toLowerCase().includes('try') || this.currentCode.toLowerCase().includes('except');
        
        return {
            totalLines: lines.length,
            hasComments,
            hasErrorHandling,
            qualityScore: this.calculateQualityScore(lines.length, hasComments, hasErrorHandling)
        };
    }

    calculateQualityScore(lines, hasComments, hasErrorHandling) {
        let score = 0;
        
        // Lines of code factor (optimal range: 10-100)
        if (lines >= 10 && lines <= 100) score += 40;
        else if (lines > 100) score += 20;
        
        // Comments factor
        if (hasComments) score += 30;
        
        // Error handling factor
        if (hasErrorHandling) score += 30;
        
        return Math.min(100, score);
    }
}

// Initialize code generator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.codeGenerator = new CodeGenerator();
});

// Add CSS styles for the code generation modal
const codeGeneratorStyles = document.createElement('style');
codeGeneratorStyles.textContent = `
    .code-generation-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }
    
    .code-generation-modal.modal-visible {
        opacity: 1;
        visibility: visible;
    }
    
    .modal-content {
        background: rgba(0, 0, 0, 0.95);
        border: 2px solid #00d4ff;
        border-radius: 15px;
        padding: 20px;
        max-width: 900px;
        width: 90%;
        max-height: 90%;
        overflow-y: auto;
        backdrop-filter: blur(15px);
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid rgba(0, 212, 255, 0.3);
    }
    
    .modal-header h3 {
        color: #00d4ff;
        font-family: 'Orbitron', monospace;
        margin: 0;
    }
    
    .modal-close {
        background: none;
        border: none;
        color: #ff4444;
        font-size: 20px;
        cursor: pointer;
        padding: 5px;
        border-radius: 5px;
        transition: background 0.3s ease;
    }
    
    .modal-close:hover {
        background: rgba(255, 68, 68, 0.2);
    }
    
    .code-request-section {
        margin-bottom: 30px;
    }
    
    .code-request-section label {
        display: block;
        color: #ffffff;
        margin-bottom: 10px;
        font-family: 'Orbitron', monospace;
    }
    
    .code-request-input {
        width: 100%;
        padding: 15px;
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(0, 212, 255, 0.5);
        border-radius: 8px;
        color: #ffffff;
        font-family: 'Orbitron', monospace;
        resize: vertical;
        margin-bottom: 15px;
    }
    
    .code-request-input:focus {
        outline: none;
        border-color: #00d4ff;
        box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
    }
    
    .template-selector {
        margin-bottom: 15px;
    }
    
    .template-select {
        width: 100%;
        padding: 10px;
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(0, 212, 255, 0.5);
        border-radius: 8px;
        color: #ffffff;
        font-family: 'Orbitron', monospace;
    }
    
    .generation-options {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        margin-bottom: 20px;
    }
    
    .generation-options label {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #cccccc;
        font-size: 14px;
        cursor: pointer;
    }
    
    .generation-options input[type="checkbox"] {
        accent-color: #00d4ff;
    }
    
    .generate-code-btn {
        width: 100%;
        padding: 15px;
        background: linear-gradient(45deg, #00d4ff, #0088cc);
        border: none;
        border-radius: 8px;
        color: #ffffff;
        font-family: 'Orbitron', monospace;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .generate-code-btn:hover:not(:disabled) {
        background: linear-gradient(45deg, #0088cc, #00d4ff);
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
        transform: translateY(-2px);
    }
    
    .generate-code-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .code-preview-section {
        border-top: 1px solid rgba(0, 212, 255, 0.3);
        padding-top: 20px;
    }
    
    .code-preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding: 10px;
        background: rgba(0, 212, 255, 0.1);
        border-radius: 8px;
    }
    
    .file-name {
        color: #00d4ff;
        font-family: 'Orbitron', monospace;
        font-weight: bold;
    }
    
    .code-actions {
        display: flex;
        gap: 10px;
    }
    
    .action-btn {
        padding: 8px 12px;
        background: rgba(0, 212, 255, 0.2);
        border: 1px solid rgba(0, 212, 255, 0.5);
        border-radius: 5px;
        color: #ffffff;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .action-btn:hover {
        background: rgba(0, 212, 255, 0.3);
        border-color: #00d4ff;
    }
    
    .code-preview {
        background: rgba(0, 0, 0, 0.8);
        border: 1px solid rgba(0, 212, 255, 0.3);
        border-radius: 8px;
        padding: 20px;
        color: #ffffff;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        line-height: 1.5;
        max-height: 400px;
        overflow-y: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
    }
    
    .generation-progress {
        text-align: center;
        padding: 20px;
        color: #00d4ff;
        font-family: 'Orbitron', monospace;
    }
    
    .progress-bar {
        width: 100%;
        height: 4px;
        background: rgba(0, 212, 255, 0.2);
        border-radius: 2px;
        margin-top: 10px;
        overflow: hidden;
    }
    
    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #00d4ff, #0088cc);
        border-radius: 2px;
        animation: progressPulse 2s infinite;
    }
    
    @keyframes progressPulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
    }
    
    /* Syntax highlighting classes */
    .language-python .keyword { color: #ff79c6; }
    .language-python .string { color: #50fa7b; }
    .language-python .comment { color: #6272a4; font-style: italic; }
    
    .language-javascript .keyword { color: #ff79c6; }
    .language-javascript .string { color: #f1fa8c; }
    .language-javascript .comment { color: #6272a4; font-style: italic; }
    
    .language-html .tag { color: #ff79c6; }
    .language-html .attribute { color: #8be9fd; }
    .language-html .string { color: #f1fa8c; }
    
    .language-css .property { color: #8be9fd; }
    .language-css .value { color: #f1fa8c; }
    .language-css .selector { color: #ff79c6; }
`;

document.head.appendChild(codeGeneratorStyles);
