from flask import Flask, jsonify, request
from flask_cors import CORS
from backend_utils import BackendUtils
from code_generator import CodeGenerator
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

utils = BackendUtils()
code_generator = CodeGenerator()

@app.route('/api/weather', methods=['GET'])
def weather():
    """Get weather information"""
    result = utils.get_weather_info()
    return jsonify({"response": result})

@app.route('/api/news', methods=['GET'])
def news():
    """Get news headlines"""
    result = utils.get_news()
    return jsonify({"response": result})

@app.route('/api/system-info', methods=['GET'])
def system_info():
    """Get detailed system information"""
    result = utils.get_system_info()
    return jsonify({"response": result})

@app.route('/api/search', methods=['POST'])
def search():
    """Perform a web search"""
    data = request.get_json()
    query = data.get('query', '')
    result = utils.perform_search(query)
    return jsonify({"response": result})

@app.route('/api/calculate', methods=['POST'])
def calculate():
    """Perform a calculation"""
    data = request.get_json()
    expression = data.get('expression', '')
    result = utils.calculate(expression)
    return jsonify({"response": result})

# Code Generation Routes
@app.route('/api/generate-code', methods=['POST'])
def generate_code():
    """Generate code files based on voice commands"""
    try:
        data = request.get_json()
        template_id = data.get('template_id')
        parameters = data.get('parameters', {})
        
        if not template_id:
            return jsonify({"success": False, "error": "Template ID is required"}), 400
        
        result = code_generator.generate_code(template_id, parameters)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/analyze-requirements', methods=['POST'])
def analyze_requirements():
    """Analyze natural language requirements to determine template and parameters"""
    try:
        data = request.get_json()
        requirements = data.get('requirements', '')
        
        if not requirements:
            return jsonify({"success": False, "error": "Requirements text is required"}), 400
        
        analysis = code_generator.analyze_requirements(requirements)
        return jsonify({"success": True, "analysis": analysis})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/get-templates', methods=['GET'])
def get_templates():
    """Get available code templates"""
    try:
        templates = code_generator.get_available_templates()
        return jsonify({"success": True, "templates": templates})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/save-file', methods=['POST'])
def save_file():
    """Save generated file to disk"""
    try:
        data = request.get_json()
        file_id = data.get('file_id')
        custom_path = data.get('custom_path')
        
        if not file_id:
            return jsonify({"success": False, "error": "File ID is required"}), 400
        
        result = code_generator.save_file(file_id, custom_path)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/get-generated-files', methods=['GET'])
def get_generated_files():
    """Get list of all generated files"""
    try:
        files = code_generator.get_generated_files()
        return jsonify({"success": True, "files": files})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/get-code-history', methods=['GET'])
def get_code_history():
    """Get code generation history"""
    try:
        history = code_generator.get_code_history()
        return jsonify({"success": True, "history": history})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "JARVIS Python backend is running"})

if __name__ == '__main__':
    print("Starting JARVIS Python Backend...")
    app.run(debug=True, host='0.0.0.0', port=5001)
