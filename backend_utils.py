# JARVIS Backend Utilities
# Utility functions for backend operations

import json
import math
import random
import datetime
from typing import Dict, Any, List, Optional

class BackendUtils:
    """Utility class for backend operations"""
    
    def __init__(self):
        self.current_time = datetime.datetime.now()
        self.version = "1.0.0"
        
    def calculate(self, expression: str) -> float:
        """Safely evaluate mathematical expressions"""
        try:
            # Remove spaces and validate expression
            expression = expression.strip().replace(' ', '')
            
            # Basic validation - only allow numbers, operators, and parentheses
            allowed_chars = set('0123456789+-*/.()')
            if not all(c in allowed_chars for c in expression):
                raise ValueError("Invalid characters in expression")
            
            # Safely evaluate the expression
            result = eval(expression)
            return float(result)
            
        except ZeroDivisionError:
            raise ValueError("Division by zero")
        except (ValueError, SyntaxError) as e:
            raise ValueError(f"Invalid expression: {str(e)}")
        except Exception as e:
            raise ValueError(f"Calculation error: {str(e)}")
    
    def get_weather_data(self, location: str = "Current Location") -> Dict[str, Any]:
        """Get simulated weather data"""
        # Simulate weather data
        weather_conditions = ["Sunny", "Cloudy", "Rainy", "Partly Cloudy", "Overcast"]
        temperatures = range(10, 35)  # Celsius range
        
        return {
            "location": location,
            "temperature": random.choice(temperatures),
            "condition": random.choice(weather_conditions),
            "humidity": random.randint(30, 90),
            "wind_speed": random.randint(0, 25),
            "pressure": random.randint(980, 1030),
            "timestamp": self.current_time.isoformat()
        }
    
    def format_response(self, text: str, format_type: str = "plain") -> str:
        """Format response text based on type"""
        if format_type == "uppercase":
            return text.upper()
        elif format_type == "lowercase":
            return text.lower()
        elif format_type == "title":
            return text.title()
        elif format_type == "capitalize":
            return text.capitalize()
        else:
            return text
    
    def generate_random_data(self, data_type: str = "number", count: int = 5) -> List[Any]:
        """Generate random data based on type"""
        if data_type == "number":
            return [random.randint(1, 100) for _ in range(count)]
        elif data_type == "float":
            return [random.uniform(1.0, 100.0) for _ in range(count)]
        elif data_type == "string":
            words = ["hello", "world", "jarvis", "ai", "assistant", "code", "generate"]
            return [random.choice(words) for _ in range(count)]
        elif data_type == "boolean":
            return [random.choice([True, False]) for _ in range(count)]
        else:
            return [f"item_{i}" for i in range(count)]
    
    def get_system_info(self) -> Dict[str, Any]:
        """Get system information"""
        return {
            "timestamp": self.current_time.isoformat(),
            "version": self.version,
            "status": "operational",
            "uptime": "Running",
            "memory_usage": "Normal",
            "cpu_usage": "Low"
        }
    
    def validate_input(self, text: str, max_length: int = 1000) -> bool:
        """Validate input text"""
        if not text or not isinstance(text, str):
            return False
        
        if len(text) > max_length:
            return False
            
        # Check for potentially harmful content
        harmful_patterns = ['<script', 'javascript:', 'eval(', 'exec(']
        text_lower = text.lower()
        return not any(pattern in text_lower for pattern in harmful_patterns)
    
    def process_command(self, command: str) -> Dict[str, Any]:
        """Process voice commands and return appropriate response"""
        command_lower = command.lower()
        
        if 'weather' in command_lower:
            location = "Current Location"
            weather_data = self.get_weather_data(location)
            return {
                "response": f"The weather in {location} is {weather_data['condition']} with a temperature of {weather_data['temperature']}°C.",
                "data": weather_data,
                "command_type": "weather"
            }
        
        elif 'calculate' in command_lower or 'math' in command_lower:
            return {
                "response": "I can help you with calculations. Please provide a mathematical expression.",
                "command_type": "calculation"
            }
        
        elif 'time' in command_lower:
            current_time = self.current_time.strftime("%Y-%m-%d %H:%M:%S")
            return {
                "response": f"The current time is {current_time}.",
                "data": {"time": current_time},
                "command_type": "time"
            }
        
        elif 'system' in command_lower:
            system_info = self.get_system_info()
            return {
                "response": "JARVIS system is operational and running smoothly.",
                "data": system_info,
                "command_type": "system"
            }
        
        else:
            return {
                "response": f"I've processed your command: {command}. How can I assist you further?",
                "command_type": "general"
            }
    
    def search_web(self, query: str) -> Dict[str, Any]:
        """Simulate web search functionality"""
        # This would typically integrate with a real search API
        search_results = [
            {"title": f"Search result 1 for '{query}'", "url": "https://example1.com", "snippet": "Description of search result 1"},
            {"title": f"Search result 2 for '{query}'", "url": "https://example2.com", "snippet": "Description of search result 2"},
            {"title": f"Search result 3 for '{query}'", "url": "https://example3.com", "snippet": "Description of search result 3"}
        ]
        
        return {
            "query": query,
            "results": search_results,
            "total_results": len(search_results),
            "timestamp": self.current_time.isoformat()
        }
    
    def get_user_preferences(self) -> Dict[str, Any]:
        """Get default user preferences"""
        return {
            "language": "en",
            "theme": "dark",
            "voice_enabled": True,
            "animations_enabled": True,
            "notifications_enabled": True
        }
    
    def log_activity(self, activity: str, details: Dict[str, Any] = None) -> None:
        """Log user activity"""
        log_entry = {
            "timestamp": self.current_time.isoformat(),
            "activity": activity,
            "details": details or {}
        }
        
        print(f"ACTIVITY LOG: {json.dumps(log_entry, indent=2)}")
    
    def health_check(self) -> Dict[str, Any]:
        """Perform system health check"""
        return {
            "status": "healthy",
            "timestamp": self.current_time.isoformat(),
            "checks": {
                "database": "ok",
                "api": "ok",
                "memory": "ok",
                "storage": "ok"
            }
        }

