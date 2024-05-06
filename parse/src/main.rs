use regex::Regex;
use serde_json::{Value, from_str};
use std::fs;

fn json_to_py(data: &str) -> String {
    let parsed_data: Value = from_str(data).expect("JSON parsing failed");
    let pattern = Regex::new(r"[^a-zA-Z0-9]").unwrap();
    let blocks = serde_json::json!({
        "startLoop": "for i in range({i}):",
        "endLoop": "",
        "collapse": "result_{qubit_label} = {qubit_label}.measure()",
        "output": "",
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
    });

    let mut python_script = vec![
        "from qupython import Qubit, quantum\n".to_string(),
        "@quantum".to_string(),
        "def runtime():".to_string()
    ];

    let mut indents = 1;
    let mut outputs = String::new();
    if let Value::Object(map) = parsed_data {
        for entry in map.values() {
            let block = entry.get("id").unwrap().as_str().unwrap();
            let mut operation = blocks.get(block).unwrap().as_str().unwrap().to_string();

            if block == "output" {
                let qubit_label = format!("q_{}", pattern.replace_all(entry["args"]["0"]["value"].as_str().unwrap(), "_"));
                outputs += &format!("result_{}, ", qubit_label);
            }

            operation = pattern.replace_all(&operation, |caps: &regex::Captures| {
                match caps.get(0).unwrap().as_str() {
                    "{qubit_label}" => format!("q_{}", pattern.replace_all(entry["args"]["0"]["value"].as_str().unwrap(), "_")),
                    "{i}" => entry["args"]["0"]["value"].to_string(),
                    "{theta}" => entry["args"]["1"]["value"].to_string(),
                    "{phi}" => entry["args"]["2"]["value"].to_string(),
                    "{lam}" => entry["args"]["3"]["value"].to_string(),
                    _ => "".to_string()
                }
            }).to_string();  // Convert Cow<'_, str> to String            

            python_script.push("\t".repeat(indents) + &operation);

            if block == "startLoop" {
                indents = 2;
            } else if block == "endLoop" {
                indents = 1;
            }
        }
    }
    python_script.push(format!("\treturn [{}]\nprint(runtime())", outputs.trim_end_matches(", ")));

    python_script.join("\n")
}

fn main() {
    let json_data = fs::read_to_string("test.json").expect("Unable to read file");
    let python_output = json_to_py(&json_data);
    println!("{}", python_output);
    // fs::write("runtime.py", python_output).expect("Unable to write file");
}