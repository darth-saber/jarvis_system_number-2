# JARVIS Code Generator
# AI-powered code generation engine for file creation

import json
import os
import re
from datetime import datetime
from typing import Dict, List, Optional, Any
import uuid

class CodeGenerator:
    def __init__(self):
        self.templates = self.load_templates()
        self.generated_files = []
        self.code_history = []
        
    def load_templates(self) -> Dict[str, Dict]:
        """Load code templates from template directory"""
        templates = {}
        template_dir = os.path.join(os.path.dirname(__file__), 'templates')
        
        if not os.path.exists(template_dir):
            return self.get_default_templates()
            
        # Load templates from directory structure
        for category in ['web', 'backend', 'database', 'config', 'docs']:
            category_path = os.path.join(template_dir, category)
            if os.path.exists(category_path):
                templates[category] = self.load_template_category(category_path)
                
        return templates if templates else self.get_default_templates()
    
    def get_default_templates(self) -> Dict[str, Dict]:
        """Default templates if template directory doesn't exist"""
        return {
            'web': {
                'html_basic': {
                    'name': 'Basic HTML',
                    'description': 'Simple HTML5 template',
                    'language': 'html',
                    'content': '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
</head>
<body>
    <h1>{{heading}}</h1>
    <p>{{content}}</p>
</body>
</html>'''
                },
                'html_responsive': {
                    'name': 'Responsive HTML',
                    'description': 'Responsive HTML5 with CSS',
                    'language': 'html',
                    'content': '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: #f4f4f4; padding: 20px; text-align: center; }
        .main { padding: 20px; }
        @media (max-width: 768px) {
            .container { padding: 10px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>{{heading}}</h1>
        </header>
        <main class="main">
            <p>{{content}}</p>
        </main>
    </div>
</body>
</html>'''
                },
                'css_basic': {
                    'name': 'Basic CSS',
                    'description': 'Simple CSS stylesheet',
                    'language': 'css',
                    'content': '''/* {{description}} */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f4f4f4;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

/* Responsive Design */
@media (max-width: 768px) {
    .container {
        padding: 10px;
    }
}'''
                },
                'javascript_basic': {
                    'name': 'Basic JavaScript',
                    'description': 'Simple JavaScript functionality',
                    'language': 'javascript',
                    'content': '''// {{description}}
document.addEventListener('DOMContentLoaded', function() {
    console.log('{{description}} loaded');
    
    // Initialize functionality
    function init() {
        // Add your initialization code here
        console.log('Initializing {{name}}');
    }
    
    // Helper functions
    function {{helperName}}() {
        // Helper function implementation
    }
    
    // Event listeners
    function setupEventListeners() {
        // Add event listeners here
    }
    
    // Initialize the script
    init();
});'''
                },
                'react_component': {
                    'name': 'React Component',
                    'description': 'Functional React component',
                    'language': 'javascript',
                    'content': '''import React from 'react';

const {{ComponentName}} = () => {
    return (
        <div className="{{componentClass}}">
            <h2>{{heading}}</h2>
            <p>{{content}}</p>
        </div>
    );
};

export default {{ComponentName}};'''
                }
            },
            'backend': {
                'python_script': {
                    'name': 'Python Script',
                    'description': 'Basic Python script template',
                    'language': 'python',
                    'content': '''#!/usr/bin/env python3
"""
{{description}}

Author: JARVIS AI Assistant
Date: {{date}}
"""

import os
import sys
from typing import Any, Dict, List, Optional

class {{ClassName}}:
    def __init__(self):
        """Initialize the {{ClassName}} class"""
        self.name = "{{ClassName}}"
        self.version = "1.0.0"
        
    def main(self):
        """Main function to run the script"""
        print(f"Running {{ClassName}} v{self.version}")
        
        # Add your main logic here
        pass
        
    def {{methodName}}(self, {{params}}):
        """
        {{methodDescription}}
        
        Args:
            {{paramDescription}}
        
        Returns:
            {{returnDescription}}
        """
        # Method implementation
        pass

if __name__ == "__main__":
    script = {{ClassName}}()
    script.main()'''
                },
                'python_api': {
                    'name': 'Python API',
                    'description': 'Flask API endpoint template',
                    'language': 'python',
                    'content': '''from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route('/api/{{endpoint}}', methods=['GET', 'POST'])
def {{endpoint_name}}():
    """
    {{endpointDescription}}
    """
    if request.method == 'GET':
        # Handle GET request
        return jsonify({
            "status": "success",
            "message": "{{successMessage}}",
            "data": {{sampleData}}
        })
    
    elif request.method == 'POST':
        # Handle POST request
        data = request.get_json()
        
        # Process the data
        result = process_data(data)
        
        return jsonify({
            "status": "success",
            "message": "Data processed successfully",
            "result": result
        })

def process_data(data):
    """
    Process incoming data
    
    Args:
        data: Input data to process
        
    Returns:
        Processed result
    """
    # Add your processing logic here
    return {"processed": True, "data": data}

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)'''
                },
                'node_js': {
                    'name': 'Node.js Script',
                    'description': 'Basic Node.js script',
                    'language': 'javascript',
                    'content': '''// {{description}}
// Author: JARVIS AI Assistant

const fs = require('fs');
const path = require('path');

class {{ClassName}} {
    constructor() {
        this.name = "{{ClassName}}";
        this.version = "1.0.0";
    }
    
    async main() {
        console.log(`Running ${this.name} v${this.version}`);
        
        // Add your main logic here
        try {
            await this.run();
        } catch (error) {
            console.error('Error:', error);
        }
    }
    
    async run() {
        // Main execution logic
        console.log('Executing {{description}}');
    }
    
    {{methodName}}({{params}}) {
        /**
         * {{methodDescription}}
         * @param {{paramTypes}} {{paramDescription}}
         * @returns {{returnDescription}}
         */
        // Method implementation
    }
}

// Run the application
const app = new {{ClassName}}();
app.main().catch(console.error);'''
                }
            },
            'config': {
                'json_config': {
                    'name': 'JSON Configuration',
                    'description': 'JSON configuration file',
                    'language': 'json',
                    'content': '''{
  "name": "{{projectName}}",
  "version": "1.0.0",
  "description": "{{description}}",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0",
    "jest": "^29.0.0"
  },
  "keywords": ["{{keyword1}}", "{{keyword2}}"],
  "author": "{{author}}",
  "license": "MIT",
  "config": {
    "{{configKey}}": "{{configValue}}"
  }
}'''
                },
                'env_file': {
                    'name': 'Environment File',
                    'description': '.env template',
                    'language': 'text',
                    'content': '''# {{description}}
# Environment Configuration

# Application Settings
APP_NAME={{projectName}}
APP_VERSION=1.0.0
NODE_ENV=development

# Server Configuration
PORT=3000
HOST=localhost

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME={{projectName}}_db
DB_USER=username
DB_PASSWORD=password

# API Keys
API_KEY=your_api_key_here
SECRET_KEY=your_secret_key_here

# External Services
REDIS_URL=redis://localhost:6379
EMAIL_SERVICE_API_KEY=your_email_api_key

# Security
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:3000'''
                },
                'yaml_config': {
                    'name': 'YAML Configuration',
                    'description': 'YAML configuration file',
                    'language': 'yaml',
                    'content': '''# {{description}}
# YAML Configuration File

app:
  name: {{projectName}}
  version: 1.0.0
  environment: development
  
server:
  host: localhost
  port: 3000
  protocol: http
  
database:
  type: postgresql
  host: localhost
  port: 5432
  name: {{projectName}}_db
  username: username
  password: password
  ssl: false
  
logging:
  level: info
  format: json
  output: stdout
  
features:
  authentication: true
  cors: true
  rate_limiting: true
  compression: true
  
external_apis:
  - name: weather_api
    url: https://api.weather.com/v1
    key: your_api_key_here
  - name: email_service
    url: https://api.email.com/v1
    key: your_email_api_key'''
                }
            },
            'database': {
                'sql_schema': {
                    'name': 'SQL Schema',
                    'description': 'SQL database schema',
                    'language': 'sql',
                    'content': '''-- {{description}}
-- Generated by JARVIS AI Assistant
-- Date: {{date}}

-- Create database
CREATE DATABASE {{databaseName}};
USE {{databaseName}};

-- {{tableName}} table
CREATE TABLE {{tableName}} (
    id INT PRIMARY KEY AUTO_INCREMENT,
    {{field1}} VARCHAR(255) NOT NULL,
    {{field2}} TEXT,
    {{field3}} DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_{{field1}} ({{field1}}),
    INDEX idx_created_at (created_at)
);

-- Insert sample data
INSERT INTO {{tableName}} ({{field1}}, {{field2}}) VALUES
    ('Sample {{field1}} 1', 'Sample {{field2}} 1'),
    ('Sample {{field1}} 2', 'Sample {{field2}} 2');

-- Views
CREATE VIEW {{viewName}} AS
SELECT 
    id,
    {{field1}},
    {{field2}},
    created_at
FROM {{tableName}}
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Stored procedures
DELIMITER //
CREATE PROCEDURE Get{{tableName}}ById(IN param_id INT)
BEGIN
    SELECT * FROM {{tableName}} WHERE id = param_id;
END //
DELIMITER ;'''
                }
            },
            'docs': {
                'readme': {
                    'name': 'README',
                    'description': 'Project README file',
                    'language': 'markdown',
                    'content': '''# {{projectName}}

{{description}}

## Features

- Feature 1: {{feature1}}
- Feature 2: {{feature2}}
- Feature 3: {{feature3}}

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- {{additionalPrerequisites}}

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/{{username}}/{{projectName}}.git
   cd {{projectName}}
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

### Basic Usage

```javascript
// Example usage
const {{projectName}} = require('./{{mainFile}}');

const instance = new {{projectName}}();
instance.start();
```

### API Endpoints

- `GET /api/health` - Health check
- `GET /api/{{endpoint}}` - {{endpointDescription}}
- `POST /api/{{endpoint}}` - {{endpointDescription}}

## Configuration

The application can be configured using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `DB_HOST` | Database host | localhost |

## Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with JARVIS AI Assistant
- Inspired by {{inspiration}}

## Support

For support, email {{email}} or join our Slack channel.

---

**Generated by JARVIS AI Assistant** on {{date}}'''
                },
                'api_docs': {
                    'name': 'API Documentation',
                    'description': 'API documentation template',
                    'language': 'markdown',
                    'content': '''# {{projectName}} API Documentation

## Overview

{{description}}

**Base URL:** `{{baseUrl}}`
**Version:** 1.0.0
**Authentication:** {{authType}}

## Authentication

{{authDescription}}

### Headers
```
Authorization: Bearer {{tokenExample}}
Content-Type: application/json
```

## Endpoints

### Health Check

#### GET /api/health

Check API health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0.0"
}
```

### {{endpoint1Name}}

#### GET /api/{{endpoint1}}

{{endpoint1Description}}

**Parameters:**
- `param1` (string, required) - Description of param1
- `limit` (integer, optional) - Number of results to return (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Example",
      "created_at": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

#### POST /api/{{endpoint1}}

Create a new {{resourceName}}.

**Request Body:**
```json
{
  "name": "New {{resourceName}}",
  "description": "Description of the {{resourceName}}"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "New {{resourceName}}",
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## Rate Limiting

API requests are limited to {{rateLimit}} requests per minute per API key.

## SDKs and Libraries

- **JavaScript/Node.js**: `npm install {{packageName}}`
- **Python**: `pip install {{pythonPackage}}`
- **PHP**: `composer require {{phpPackage}}`

## Webhooks

{{webhookDescription}}

### Webhook Events

- `{{event1}}` - Fired when {{event1Description}}
- `{{event2}}` - Fired when {{event2Description}}

---

**Generated by JARVIS AI Assistant** on {{date}}'''
                }
            }
        }
    
    def load_template_category(self, category_path: str) -> Dict:
        """Load templates from a specific category directory"""
        templates = {}
        for file in os.listdir(category_path):
            if file.endswith('.json'):
                template_path = os.path.join(category_path, file)
                try:
                    with open(template_path, 'r') as f:
                        template_data = json.load(f)
                        templates[template_data.get('id', file[:-5])] = template_data
                except Exception as e:
                    print(f"Error loading template {file}: {e}")
        return templates
    
    def generate_code(self, template_id: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate code based on template and parameters
        
        Args:
            template_id: ID of the template to use
            parameters: Parameters to fill in the template
            
        Returns:
            Dictionary with generated code and metadata
        """
        try:
            # Find template
            template = self.find_template(template_id)
            if not template:
                return {
                    "success": False,
                    "error": f"Template '{template_id}' not found"
                }
            
            # Generate filename
            filename = self.generate_filename(template, parameters)
            
            # Fill template with parameters
            content = self.fill_template(template['content'], parameters)
            
            # Validate generated code
            validation_result = self.validate_code(content, template['language'])
            
            # Create result
            result = {
                "success": True,
                "filename": filename,
                "content": content,
                "language": template['language'],
                "template_used": template['name'],
                "parameters": parameters,
                "validation": validation_result,
                "timestamp": datetime.now().isoformat(),
                "id": str(uuid.uuid4())
            }
            
            # Store in history
            self.code_history.append(result)
            self.generated_files.append({
                "id": result['id'],
                "filename": filename,
                "path": f"generated_files/{filename}",
                "created_at": result['timestamp']
            })
            
            return result
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def find_template(self, template_id: str) -> Optional[Dict]:
        """Find template by ID across all categories"""
        for category, templates in self.templates.items():
            if template_id in templates:
                return templates[template_id]
        return None
    
    def fill_template(self, template_content: str, parameters: Dict[str, Any]) -> str:
        """Fill template with parameters"""
        content = template_content
        
        # Replace parameters
        for key, value in parameters.items():
            placeholder = f"{{{{{key}}}}}"
            content = content.replace(placeholder, str(value))
        
        # Handle special cases
        content = content.replace("{{date}}", datetime.now().strftime("%Y-%m-%d"))
        
        return content
    
    def generate_filename(self, template: Dict, parameters: Dict[str, Any]) -> str:
        """Generate appropriate filename for the template"""
        language = template['language']
        name = parameters.get('name', parameters.get('projectName', 'file'))
        
        # Clean filename
        filename = re.sub(r'[^\w\-_\.]', '_', name)
        
        # Add appropriate extension
        extensions = {
            'html': '.html',
            'css': '.css',
            'javascript': '.js',
            'python': '.py',
            'json': '.json',
            'yaml': '.yml',
            'sql': '.sql',
            'markdown': '.md',
            'text': '.txt'
        }
        
        extension = extensions.get(language, '.txt')
        return f"{filename}{extension}"
    
    def validate_code(self, content: str, language: str) -> Dict[str, Any]:
        """Basic validation of generated code"""
        validation = {
            "is_valid": True,
            "warnings": [],
            "errors": []
        }
        
        # Basic checks based on language
        if language == 'html':
            if '<html' not in content.lower():
                validation["warnings"].append("Missing HTML declaration")
            if '<head>' not in content.lower():
                validation["warnings"].append("Missing head section")
                
        elif language == 'javascript':
            if 'function' not in content and 'const ' not in content and 'var ' not in content:
                validation["warnings"].append("No functions or variables detected")
                
        elif language == 'python':
            if 'def ' not in content and 'class ' not in content:
                validation["warnings"].append("No functions or classes detected")
            if 'import ' not in content and 'from ' not in content:
                validation["warnings"].append("No imports detected")
        
        elif language == 'sql':
            if 'CREATE' not in content.upper():
                validation["warnings"].append("No CREATE statements found")
        
        # Set validation status
        validation["is_valid"] = len(validation["errors"]) == 0
        
        return validation
    
    def get_available_templates(self) -> Dict[str, List[Dict]]:
        """Get all available templates organized by category"""
        available = {}
        for category, templates in self.templates.items():
            available[category] = []
            for template_id, template in templates.items():
                available[category].append({
                    "id": template_id,
                    "name": template['name'],
                    "description": template['description'],
                    "language": template['language']
                })
        return available
    
    def get_generated_files(self) -> List[Dict]:
        """Get list of all generated files"""
        return self.generated_files
    
    def get_code_history(self) -> List[Dict]:
        """Get code generation history"""
        return self.code_history
    
    def save_file(self, file_id: str, custom_path: str = None) -> Dict[str, Any]:
        """Save generated file to disk"""
        try:
            # Find the generated file
            file_info = None
            for file_data in self.generated_files:
                if file_data['id'] == file_id:
                    file_info = file_data
                    break
            
            if not file_info:
                return {
                    "success": False,
                    "error": "File not found"
                }
            
            # Find the actual content
            content = None
            for history_item in self.code_history:
                if history_item['id'] == file_id:
                    content = history_item['content']
                    break
            
            if not content:
                return {
                    "success": False,
                    "error": "File content not found"
                }
            
            # Determine save path
            if custom_path:
                save_path = custom_path
            else:
                save_path = file_info['path']
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            
            # Write file
            with open(save_path, 'w') as f:
                f.write(content)
            
            return {
                "success": True,
                "path": save_path,
                "filename": file_info['filename']
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def analyze_requirements(self, requirements: str) -> Dict[str, Any]:
        """Analyze natural language requirements to determine template and parameters"""
        requirements_lower = requirements.lower()
        
        # Determine language/technology
        technology_keywords = {
            'python': ['python', 'script', 'data analysis', 'machine learning'],
            'javascript': ['javascript', 'js', 'node', 'react', 'vue', 'angular'],
            'html': ['html', 'web page', 'website', 'html5'],
            'css': ['css', 'styling', 'responsive', 'styles'],
            'sql': ['database', 'sql', 'table', 'schema', 'query'],
            'json': ['json', 'config', 'configuration', 'settings'],
            'markdown': ['readme', 'documentation', 'docs', 'readme']
        }
        
        detected_tech = None
        for tech, keywords in technology_keywords.items():
            if any(keyword in requirements_lower for keyword in keywords):
                detected_tech = tech
                break
        
        # Determine template type
        template_types = {
            'basic': ['simple', 'basic', 'hello world', 'minimal'],
            'api': ['api', 'endpoint', 'rest', 'server'],
            'component': ['component', 'react', 'vue', 'angular'],
            'responsive': ['responsive', 'mobile', 'tablet', 'adaptive']
        }
        
        detected_type = 'basic'  # default
        for template_type, keywords in template_types.items():
            if any(keyword in requirements_lower for keyword in keywords):
                detected_type = template_type
                break
        
        # Extract parameters from requirements
        parameters = self.extract_parameters(requirements, detected_tech)
        
        # Recommend template
        recommended_template = self.recommend_template(detected_tech, detected_type)
        
        return {
            "detected_technology": detected_tech,
            "template_type": detected_type,
            "parameters": parameters,
            "recommended_template": recommended_template,
            "confidence": self.calculate_confidence(requirements_lower, detected_tech, detected_type)
        }
    
    def extract_parameters(self, requirements: str, technology: str) -> Dict[str, Any]:
        """Extract parameters from natural language requirements"""
        parameters = {}
        
        # Extract name/title
        name_matches = re.findall(r'(?:called|named|for)\s+["\']?([^"\'\s,.]+)["\']?', requirements.lower())
        if name_matches:
            parameters['name'] = name_matches[0]
            parameters['projectName'] = name_matches[0]
        else:
            parameters['name'] = 'Generated Project'
            parameters['projectName'] = 'Generated Project'
        
        # Extract description
        parameters['description'] = requirements
        
        # Technology-specific parameters
        if technology == 'python':
            parameters['ClassName'] = parameters['name'].replace(' ', '').replace('-', '')
            parameters['methodName'] = 'main'
            parameters['helperName'] = 'helper_function'
            parameters['author'] = 'JARVIS AI'
            
        elif technology == 'javascript':
            parameters['ClassName'] = parameters['name'].replace(' ', '').replace('-', '')
            parameters['ComponentName'] = parameters['name'].replace(' ', '')
            parameters['componentClass'] = parameters['name'].lower().replace(' ', '-')
            
        elif technology == 'html':
            parameters['title'] = parameters['name']
            parameters['heading'] = parameters['name']
            parameters['content'] = f"Welcome to {parameters['name']}"
        
        # Add current date
        parameters['date'] = datetime.now().strftime("%Y-%m-%d")
        
        return parameters
    
    def recommend_template(self, technology: str, template_type: str) -> str:
        """Recommend template based on detected technology and type"""
        template_map = {
            'python': {
                'basic': 'python_script',
                'api': 'python_api'
            },
            'javascript': {
                'basic': 'javascript_basic',
                'component': 'react_component'
            },
            'html': {
                'basic': 'html_basic',
                'responsive': 'html_responsive'
            },
            'css': {
                'basic': 'css_basic'
            },
            'json': {
                'basic': 'json_config'
            },
            'sql': {
                'basic': 'sql_schema'
            },
            'markdown': {
                'basic': 'readme'
            }
        }
        
        return template_map.get(technology, {}).get(template_type, f"{technology}_{template_type}")
    
    def calculate_confidence(self, requirements: str, technology: str, template_type: str) -> float:
        """Calculate confidence score for the analysis"""
        score = 0.0
        
        # Base confidence
        if technology:
            score += 0.4
        if template_type:
            score += 0.3
        
        # Check for specific keywords
        specific_keywords = ['create', 'generate', 'build', 'make', 'new']
        if any(keyword in requirements for keyword in specific_keywords):
            score += 0.1
        
        # Check for detailed descriptions
        if len(requirements) > 20:
            score += 0.1
        
        # Check for technical terms
        tech_terms = ['function', 'class', 'method', 'api', 'endpoint', 'component']
        if any(term in requirements for term in tech_terms):
            score += 0.1
        
        return min(score, 1.0)
