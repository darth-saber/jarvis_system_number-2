// JARVIS Core System
// Main functionality and command processing

class JarvisCore {
    constructor() {
        this.isListening = false;
        this.commandHistory = [];
        this.systemCommands = {
            'time': () => this.getCurrentTime(),
            'date': () => this.getCurrentDate(),
            'weather': () => this.getWeatherInfo(),
            'system info': () => this.showSystemInfo(),
            'open browser': () => this.openBrowser(),
            'search': (query) => this.performSearch(query),
            'play music': () => this.playMusic(),
            'stop music': () => this.stopMusic(),
            'increase volume': () => this.adjustVolume('up'),
            'decrease volume': () => this.adjustVolume('down'),
            'take screenshot': () => this.takeScreenshot(),
            'open calculator': () => this.openCalculator(),
            'show files': () => this.showFileManager(),
            'joke': () => this.tellJoke(),
            'quote': () => this.getInspirationalQuote(),
            'calculate': (expression) => this.calculate(expression),
            'translate': (text) => this.translate(text),
            'reminder': (reminder) => this.setReminder(reminder),
            'timer': (duration) => this.setTimer(duration),
            'news': () => this.getNews(),
            'temperature': () => this.getTemperature(),
            'help': () => this.showHelp()
        };
        
        this.init();
    }

    init() {
        console.log('JARVIS Core System Initializing...');
        this.updateTime();
        this.initializeAnimations();
        this.setupEventListeners();
        
        // Welcome message
        setTimeout(() => {
            this.speak("Good evening, sir. I am JARVIS, your intelligent assistant. How may I be of service today?");
        }, 1000);
    }

    updateTime() {
        const updateTimeDisplay = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString();
            const dateString = now.toLocaleDateString();
            
            const timeElement = document.getElementById('systemTime');
            const detailedTimeElement = document.getElementById('detailedTime');
            
            if (timeElement) {
                timeElement.textContent = timeString;
            }
            
            if (detailedTimeElement) {
                detailedTimeElement.textContent = `${dateString} ${timeString}`;
            }
        };
        
        updateTimeDisplay();
        setInterval(updateTimeDisplay, 1000);
    }

    async processCommand(command) {
        const normalizedCommand = command.toLowerCase().trim();

        // Add to command history
        this.commandHistory.push({
            command: normalizedCommand,
            timestamp: new Date(),
            success: false
        });

        // Display command
        this.displayCommand(command);

        // Process the command
        try {
            const response = await this.executeCommand(normalizedCommand);
            this.displayResponse(response);

            // Update command history status
            if (this.commandHistory.length > 0) {
                this.commandHistory[this.commandHistory.length - 1].success = true;
            }

            return response;
        } catch (error) {
            console.error('Error processing command:', error);
            const errorResponse = "Sorry, I encountered an error processing your command.";
            this.displayResponse(errorResponse);
            return errorResponse;
        }
    }

    async executeCommand(command) {
        // Commands that use the Python backend
        const backendCommands = {
            'weather': '/api/weather',
            'news': '/api/news',
            'system info': '/api/system-info'
        };

        // Check for backend commands first
        for (const [cmd, endpoint] of Object.entries(backendCommands)) {
            if (command.includes(cmd)) {
                try {
                    const response = await fetch(`http://localhost:5001${endpoint}`);
                    const data = await response.json();
                    return data.response;
                } catch (error) {
                    console.error(`Error calling backend for ${cmd}:`, error);
                    return `Sorry, I couldn't retrieve ${cmd} information right now.`;
                }
            }
        }

        // Handle search commands with backend
        if (command.includes('search for') || command.includes('google')) {
            const query = command.replace(/search for|google/gi, '').trim();
            if (query) {
                try {
                    const response = await fetch('http://localhost:5001/api/search', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query })
                    });
                    const data = await response.json();
                    return data.response;
                } catch (error) {
                    console.error('Error performing search:', error);
                    return "I couldn't perform the search right now.";
                }
            } else {
                return "I need something to search for. What are you looking for?";
            }
        }

        // Handle calculate commands with backend
        if (command.includes('calculate') || command.includes('what is')) {
            const expression = command.replace(/calculate|what is/gi, '').trim();
            if (expression) {
                try {
                    const response = await fetch('http://localhost:5001/api/calculate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ expression })
                    });
                    const data = await response.json();
                    return data.response;
                } catch (error) {
                    console.error('Error performing calculation:', error);
                    return "That calculation doesn't add up. Double-check your numbers and try again.";
                }
            }
        }

        // Check for direct commands (client-side)
        for (const [cmd, action] of Object.entries(this.systemCommands)) {
            if (command.includes(cmd) && !backendCommands[cmd]) {
                if (typeof action === 'function') {
                    if (action.length === 0) {
                        return action.call(this);
                    } else {
                        // Extract parameters from command
                        const params = command.replace(cmd, '').trim();
                        return action.call(this, params);
                    }
                }
            }
        }

        // Default responses for unrecognized commands
        const responses = [
            "I didn't quite catch that. Try asking for 'help' to see what I'm capable of.",
            "Hmm, that's outside my current repertoire. Want me to show you what I can actually do?",
            "I can't help with that right now. But I can definitely handle most other requests.",
            "I need more details to work with. Be specific and I'll deliver results."
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    // System Commands Implementation
    getCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        return `The time is ${timeString}. Always punctual, just like Stark Industries.`;
    }

    getCurrentDate() {
        const now = new Date();
        const dateString = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        return `Today is ${dateString}`;
    }

    getWeatherInfo() {
        // Simulated weather data (in a real implementation, this would call a weather API)
        const weatherConditions = [
            "Sunny, 72°F - Perfect weather for productivity!",
            "Partly cloudy, 68°F - A great day to tackle those projects!",
            "Clear skies, 75°F - Excellent conditions for your daily tasks!",
            "Light breeze, 70°F - Beautiful weather to work on innovation!",
            "Cloudy, 65°F - Perfect indoor working weather!"
        ];
        
        const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        return `Weather update: ${condition}`;
    }

    showSystemInfo() {
        const info = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            cookies: navigator.cookieEnabled ? 'Enabled' : 'Disabled',
            online: navigator.onLine ? 'Online' : 'Offline'
        };
        
        return `System Status: ${info.platform} browser, ${info.screenResolution} display, ${info.language} locale. Everything's running smoothly - no surprise there.`;
    }

    openBrowser() {
        window.open('https://www.google.com', '_blank');
        return "Opening your browser. Google, here we come.";
    }

    performSearch(query) {
        if (query) {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            window.open(searchUrl, '_blank');
            return `Searching for "${query}" right now. Let's see what we can find.`;
        } else {
            return "I need something to search for. What are you looking for?";
        }
    }

    playMusic() {
        // Simulate music playback
        return "Playing background music. Please note that this is a demo - actual music playback would require additional setup.";
    }

    stopMusic() {
        return "Music playback stopped.";
    }

    adjustVolume(direction) {
        return direction === 'up' ? "Volume increased." : "Volume decreased.";
    }

    takeScreenshot() {
        // In a real implementation, this would capture the screen
        return "Screenshot functionality would be implemented here with screen capture APIs.";
    }

    openCalculator() {
        return "Calculator application would open here in a full implementation.";
    }

    showFileManager() {
        if (window.jarvisUI) {
            window.jarvisUI.showFileManager();
        }
        return "Opening file manager interface.";
    }

    tellJoke() {
        const jokes = [
            "Why don't scientists trust atoms? Because they make up everything!",
            "Why did the scarecrow win an award? Because he was outstanding in his field!",
            "Why don't eggs tell jokes? They'd crack each other up!",
            "What do you call a fake noodle? An impasta!",
            "Why did the math book look so sad? Because it was full of problems!",
            "Why did Iron Man refuse to play cards? Because he was afraid of a full house!"
        ];
        
        return jokes[Math.floor(Math.random() * jokes.length)];
    }

    getInspirationalQuote() {
        const quotes = [
            "The only way to do great work is to love what you do. - Steve Jobs",
            "Innovation distinguishes between a leader and a follower. - Steve Jobs",
            "Life is what happens to you while you're busy making other plans. - John Lennon",
            "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
            "It is during our darkest moments that we must focus to see the light. - Aristotle",
            "Sometimes you gotta run before you can walk. - Tony Stark"
        ];
        
        return quotes[Math.floor(Math.random() * quotes.length)];
    }

    calculate(expression) {
        try {
            // Basic math evaluation (be careful with eval in production!)
            const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
            const result = eval(sanitized);
            return `The answer is: ${result}. Math was never this easy, even for Tony Stark.`;
        } catch (error) {
            return "That calculation doesn't add up. Double-check your numbers and try again.";
        }
    }

    translate(text) {
        return `Translation service would process: "${text}" in a full implementation.`;
    }

    setReminder(reminder) {
        return `Reminder set: ${reminder}. I would notify you about this later in a full implementation.`;
    }

    setTimer(duration) {
        return `Timer set for ${duration}. I would start counting down in a full implementation.`;
    }

    getNews() {
        const newsTopics = [
            "technology innovation in artificial intelligence",
            "space exploration and recent discoveries",
            "renewable energy breakthroughs",
            "cybersecurity developments",
            "scientific research advances"
        ];
        
        const topic = newsTopics[Math.floor(Math.random() * newsTopics.length)];
        return `Here's what's trending: Latest developments in ${topic}. Check your news app for detailed updates.`;
    }

    getTemperature() {
        return "Temperature sensor would provide readings in a full implementation with hardware access.";
    }

    showHelp() {
        return `Available commands: ${Object.keys(this.systemCommands).join(', ')}. You can also say "search for [query]" or "calculate [expression]".`;
    }

    // Display Methods
    displayCommand(command) {
        const commandElement = document.getElementById('commandText');
        if (commandElement) {
            commandElement.textContent = command;
            
            // Add animation
            commandElement.style.transform = 'scale(1.05)';
            setTimeout(() => {
                commandElement.style.transform = 'scale(1)';
            }, 200);
        }
    }

    displayResponse(response) {
        const responseElement = document.getElementById('responseText');
        if (responseElement) {
            // Typewriter effect
            this.typewriterEffect(responseElement, response);
        }
    }

    typewriterEffect(element, text) {
        element.textContent = '';
        let i = 0;
        
        const typeWriter = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 30);
            }
        };
        
        typeWriter();
    }

    // Speech Synthesis
    speak(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.8;  // Slower, more deliberate pace
            utterance.pitch = 0.8; // Lower pitch for masculine, authoritative tone
            utterance.volume = 0.8;

            // Try to use a British voice for authentic JARVIS sound
            const voices = speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice =>
                voice.lang.startsWith('en-GB') || // British English
                voice.name.includes('Daniel') || // Common British male voice
                voice.name.includes('Arthur') ||
                voice.name.includes('Google UK') ||
                voice.name.includes('Microsoft Zira') ||
                voice.name.includes('Natural')
            );

            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            speechSynthesis.speak(utterance);
        }
    }

    // Animation Initialization
    initializeAnimations() {
        // Initialize particle effects
        this.animateParticles();
        
        // Initialize system metrics animations
        this.animateSystemMetrics();
    }

    animateParticles() {
        const particles = document.querySelectorAll('.particle');
        particles.forEach((particle, index) => {
            const randomX = Math.random() * window.innerWidth;
            const randomY = Math.random() * window.innerHeight;
            
            particle.style.left = randomX + 'px';
            particle.style.top = randomY + 'px';
            
            // Random animation delays
            particle.style.animationDelay = (Math.random() * 6) + 's';
        });
    }

    animateSystemMetrics() {
        // Simulate CPU and memory usage
        const updateMetrics = () => {
            const cpuElement = document.getElementById('cpuUsage');
            const memoryElement = document.getElementById('memoryUsage');
            const networkElement = document.getElementById('networkStatus');
            
            if (cpuElement) {
                const cpuUsage = Math.floor(Math.random() * 30) + 10; // 10-40%
                cpuElement.textContent = cpuUsage + '%';
                cpuElement.style.color = cpuUsage > 70 ? '#ff4444' : '#00ff00';
            }
            
            if (memoryElement) {
                const memoryUsage = Math.floor(Math.random() * 40) + 30; // 30-70%
                memoryElement.textContent = memoryUsage + '%';
                memoryElement.style.color = memoryUsage > 80 ? '#ff4444' : '#00ff00';
            }
            
            if (networkElement) {
                networkElement.textContent = navigator.onLine ? 'Online' : 'Offline';
                networkElement.style.color = navigator.onLine ? '#00ff00' : '#ff4444';
            }
        };
        
        updateMetrics();
        setInterval(updateMetrics, 3000);
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey || event.metaKey) {
                switch(event.key) {
                    case 'k':
                        event.preventDefault();
                        this.toggleSearch();
                        break;
                    case 'f':
                        event.preventDefault();
                        this.showFileManager();
                        break;
                    case 'i':
                        event.preventDefault();
                        this.showSystemInfo();
                        break;
                }
            }
        });
    }

    toggleSearch() {
        if (window.jarvisUI) {
            window.jarvisUI.toggleSearchInterface();
        }
    }

    // Public API
    startListening() {
        this.isListening = true;
        console.log('JARVIS: Voice recognition started');
    }

    stopListening() {
        this.isListening = false;
        console.log('JARVIS: Voice recognition stopped');
    }

    getCommandHistory() {
        return this.commandHistory;
    }

    clearHistory() {
        this.commandHistory = [];
    }
}

// Initialize JARVIS when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.jarvisCore = new JarvisCore();
});
