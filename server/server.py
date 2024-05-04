import json, io, sys
from flask import Flask, request, jsonify
from parse_json import json_to_py
app = Flask(__name__)


@app.route('/process', methods=['POST'])
def handle_request():
    print("Handling request")
    
    script = json.loads(request.data.decode())

    try:
        code = json_to_py(script)
        print("Generated code")
        print(code)

        stdout_buffer = io.StringIO()
        sys.stdout = stdout_buffer

        # Execute the script string
        exec(code)

        # Get the output from the string buffer
        output = stdout_buffer.getvalue()

        # Reset stdout to its original value
        sys.stdout = sys.__stdout__

        print("Execution complete")

        print(output)
    except Exception as e:
        print("Error!", e)
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
