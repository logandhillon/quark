from qupython import Qubit, quantum
import json
import subprocess
from flask import Flask, request, jsonify
from parse_json import json_to_py
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})


@app.route('/process', methods=['POST'])
def handle_request():
    print("Handling request")

    script = json.loads(request.data.decode())

    try:
        code = json_to_py(script)
        print("Generated code")
        print(code)

        with open("output.py", "w") as f:
            f.write(code)

        result = subprocess.run(
            ['python3', 'output.py'], capture_output=True, text=True)

        print("Execution complete")

        output = result.stdout
        print(output)

        return jsonify({"output": output}), 200
    except Exception as e:
        print("Error!", e)
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
