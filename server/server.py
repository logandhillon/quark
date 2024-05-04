from flask import Flask, request, jsonify
from parse_json import json_to_py
app = Flask(__name__)

def process_data(data):
    # Process the JSON data received from the client
    print("Processing data:", data)
    # Add your processing logic here
    return True

@app.route('/process', methods=['POST'])
def handle_request():
    # Ensure the request has JSON content
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    
    # Get the JSON data
    code = request.get_json()
    
    # Process the data
    try:
        result = json_to_py(code)
        return jsonify({result})
    except Exception as e:
        # Handle exceptions that may occur during processing
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
