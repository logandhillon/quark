import json
import re
from functools import wraps

pattern = re.compile(r'[^a-zA-Z0-9]')

def json_to_py(data):

    # data = json.load(open("test.json", "r"))

    # Define the mapping from JSON "id" to Python code
    blocks = {
        "startLoop": "for i in range({i}):",
        "endLoop": "", # Nothing
        "collapse": "result_{qubit_label} = {qubit_label}.measure()",
        "output": "", # Adds to outputs list
        "setQubit": "{qubit_label} = Qubit()",
        "hadamard": "{qubit_label}.h()",
        "phase": "{qubit_label}.p({theta})",
        "rotX": "{qubit_label}.rx({theta})",
        "rotY": "{qubit_label}.ry({theta})",
        "rotZ": "{qubit_label}.rz({theta})",
        "sGate": "{qubit_label}.s()",
        "sAdjoint": "{qubit_label}.sdg()",
        "tGate": "{qubit_label}.t()",
        "tAdjoint": "{qubit_label}.tdg()",
        "uGate": "{qubit_label}.u({theta}, {phi}, {lam})",
        "pauliX": "{qubit_label}.x()",
        "pauliY": "{qubit_label}.y()",
        "pauliZ": "{qubit_label}.z()"
    }

    # Start building the Python script
    python_script = [
        "from qupython import Qubit, quantum\n",
        "@quantum",
        "def runtime():"
    ]

    # Process each operation in the JSON
    indents = 1
    outputs = []
    for entry in data.values():
        block = entry["id"]

        # Add output to outputs list if is output
        if block == "output":
            outputs.append("result_{}".format("q_" + pattern.sub('_', entry["args"]["0"]["value"])))

        # Get code equivalent of block id
        operation = blocks.get(block)
        print(operation)
        try:
            operation = operation.replace("{qubit_label}", "q_" + pattern.sub('_', entry["args"]["0"]["value"]))
        except KeyError:
            pass
        try:
            operation = operation.replace("{i}", entry["args"]["0"]["value"])
        except KeyError:
            pass
        try:
            operation = operation.replace("{theta}", entry["args"]["1"]["value"])
        except KeyError:
            pass
        try:
            operation = operation.replace("{phi}", entry["args"]["2"]["value"])
        except KeyError:
            pass
        try:
            operation = operation.replace("{lam}", entry["args"]["3"]["value"])
        except KeyError:
            pass

        python_script.append("\t" * indents + operation)

        # Set indents on loop control
        if block == "startLoop":
            indents = 2
        elif block == "endLoop":
            indents = 1
    
    python_script.append("\treturn {}\nprint(runtime())".format(outputs))

    # Return the complete script as a single string
    return "\n".join(python_script)

# with open("runtime.py", "w") as py_file:
#     py_file.write(json_to_py())