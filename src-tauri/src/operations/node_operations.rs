use chrono::Local;
use serde_json::Value;
use std::{
    fs,
    io::{BufRead, BufReader, Write},
    process::{Command, Stdio},
    sync::{mpsc, Arc, Mutex},
};
use tauri::Manager;
use tauri::State;

use crate::{
    error::errors::AppError,
    logger::logger::{create_log_file, write_to_log},
    store::store::{get_run_node_on_startup, update_run_node_on_startup},
    types::types::{AppState, NodeInfo, NodeProcess, OperationResult, Result},
    utils::utils::{
        check_ports_availability, get_binary_path, get_node_ports, get_nodes_dir,
        is_node_process_running, kill_node_process, strip_ansi_escapes,
    },
};

pub async fn create_node(
    state: State<'_, AppState>,
    node_name: String,
    server_port: u32,
    swarm_port: u32,
    run_on_startup: bool,
) -> Result<OperationResult> {
    let nodes_dir = get_nodes_dir(&state.app_handle);
    fs::create_dir_all(&nodes_dir).map_err(|e| AppError::IoError(e.to_string()))?;

    let binary_path = get_binary_path(&state.app_handle);
    let output = Command::new(binary_path)
        .args(&[
            "--node-name",
            &node_name,
            "--home",
            nodes_dir
                .to_str()
                .ok_or_else(|| AppError::Custom("Failed to convert path to string".to_string()))?,
            "init",
            "--server-port",
            &server_port.to_string(),
            "--swarm-port",
            &swarm_port.to_string(),
        ])
        .output()?;

    if !output.status.success() {
        return Ok(OperationResult {
            success: false,
            message: strip_ansi_escapes(&String::from_utf8_lossy(&output.stderr)),
        });
    }

    create_log_file(&state.app_handle, &node_name)?;
    // Write stdout and stderr to log
    write_to_log(
        &state.app_handle,
        &node_name,
        &strip_ansi_escapes(&String::from_utf8_lossy(&output.stdout)),
    )
    .map_err(|e| AppError::Custom(format!("Failed to log stdout: {}", e)))?;
    write_to_log(
        &state.app_handle,
        &node_name,
        &strip_ansi_escapes(&String::from_utf8_lossy(&output.stderr)),
    )
    .map_err(|e| AppError::Custom(format!("Failed to log stderr: {}", e)))?;

    update_run_node_on_startup(&state, &node_name, run_on_startup)?;

    Ok(OperationResult {
        success: true,
        message: "Node initialized successfully".to_string(),
    })
}

pub fn get_nodes(state: State<'_, AppState>) -> Result<Vec<NodeInfo>> {
    let nodes_dir = get_nodes_dir(&state.app_handle);
    let mut node_infos = Vec::new();

    for entry in fs::read_dir(nodes_dir)? {
        let entry = entry?;
        let node_name = entry
            .file_name()
            .to_str()
            .ok_or(AppError::Custom(
                "Failed to convert path to string".to_string(),
            ))?
            .to_owned();

        if let Ok(config) = get_node_ports(&node_name, &state.app_handle) {
            let is_running = is_node_process_running(&node_name);
            let run_on_startup = get_run_node_on_startup(&state, &node_name)?;

            node_infos.push(NodeInfo {
                name: node_name,
                is_running,
                run_on_startup,
                node_ports: config,
            });
        }
    }

    Ok(node_infos)
}

pub async fn update_node_config(
    state: State<'_, AppState>,
    original_node_name: String,
    node_name: String,
    server_port: u32,
    swarm_port: u32,
    run_on_startup: bool,
) -> Result<OperationResult> {
    let config_path = get_nodes_dir(&state.app_handle)
        .join(&original_node_name)
        .join("config.toml");
    let config_content = fs::read_to_string(&config_path)?;

    let mut config: Value = toml::from_str(&config_content)?;

    // Modify the "swarm" section by changing the port numbers to 1234
    if let Some(swarm) = config.get_mut("swarm") {
        if let Some(listen) = swarm.get_mut("listen").and_then(|v| v.as_array_mut()) {
            for entry in listen.iter_mut() {
                if let Some(s) = entry.as_str() {
                    // Replace the port number with 1234 in all entries
                    let new_value = change_port_in_path(s, &swarm_port.to_string());
                    *entry = Value::String(new_value); // Update the entry with a new string
                }
            }
        }
    }

    // Modify the "server" section by changing the port numbers to 9876
    if let Some(server) = config.get_mut("server") {
        if let Some(listen) = server.get_mut("listen").and_then(|v| v.as_array_mut()) {
            for entry in listen.iter_mut() {
                if let Some(s) = entry.as_str() {
                    // Replace the port number with 9876 in all entries
                    let new_value = change_port_in_path(s, &server_port.to_string());
                    *entry = Value::String(new_value); // Update the entry with a new string
                }
            }
        }
    }

    // Serialize the updated config back to TOML
    let updated_content = toml::to_string(&config)?;

    // Write the updated content back to the file
    fs::write(&config_path, updated_content)?;

    update_run_node_on_startup(&state, &node_name, run_on_startup)?;

    // Rename the node directory if the name has changed
    if original_node_name != node_name {
        let nodes_dir = get_nodes_dir(&state.app_handle);
        let node_dir = nodes_dir.join(&original_node_name);
        let new_node_dir = nodes_dir.join(&node_name);
        fs::rename(&node_dir, &new_node_dir)?;
    }

    Ok(OperationResult {
        success: true,
        message: format!(
            "Configuration for node '{}' has been updated successfully.",
            node_name
        ),
    })
}

// Helper function to change the port in the path-like string
fn change_port_in_path(address: &str, new_port: &str) -> String {
    // Split the string by '/'
    let mut parts: Vec<&str> = address.split('/').collect();

    // Find and replace the part that is the port (should be between tcp/ or udp/ and optional extra like quic-v1)
    for i in 0..parts.len() {
        if parts[i] == "tcp" || parts[i] == "udp" {
            if i + 1 < parts.len() {
                parts[i + 1] = new_port; // The next part after "tcp" or "udp" should be the port
            }
        }
    }

    // Join the parts back into a single string
    parts.join("/")
}

pub async fn start_node(state: State<'_, AppState>, node_name: String) -> Result<OperationResult> {
    let app_handle = state.app_handle.clone();
    let node_manager = state.node_manager.clone();

    let mut manager = node_manager
        .lock()
        .map_err(|e| AppError::Custom(format!("Failed to lock node manager: {}", e)))?;

    if manager.nodes.contains_key(&node_name) {
        return Ok(OperationResult {
            success: false,
            message: "Node is already running".to_string(),
        });
    }

    let config = get_node_ports(&node_name, &app_handle)?;
    check_ports_availability(&config)?;

    let nodes_dir = get_nodes_dir(&app_handle);
    let binary_path = get_binary_path(&app_handle);

    let mut process = Command::new(binary_path)
        .args(&[
            "--node-name",
            &node_name,
            "--home",
            nodes_dir
                .to_str()
                .ok_or_else(|| AppError::Custom("Failed to convert path to string".to_string()))?,
            "run",
        ])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| AppError::Custom(format!("Failed to spawn node process: {}", e)))?;

    let (tx, rx) = mpsc::channel::<String>();
    let output = Arc::new(Mutex::new(String::new()));

    let stdin = process
        .stdin
        .take()
        .ok_or_else(|| AppError::Custom("Failed to capture stdin".to_string()))?;
    let stdout = process
        .stdout
        .take()
        .ok_or_else(|| AppError::Custom("Failed to capture stdout".to_string()))?;
    let stderr = process
        .stderr
        .take()
        .ok_or_else(|| AppError::Custom("Failed to capture stderr".to_string()))?;

    // Spawn a thread to handle stdin
    std::thread::spawn({
        let node_name = node_name.clone();
        let app_handle = state.app_handle.clone();
        move || {
            let mut stdin = stdin;
            for input in rx {
                // Log the stdin input
                if let Err(e) = write_to_log(&app_handle, &node_name, &format!("STDIN: {}", input))
                {
                    eprintln!("Failed to log stdin for node {}: {}", node_name, e);
                }

                // Write to stdin
                if writeln!(stdin, "{}", input).is_err() {
                    eprintln!("Failed to write to stdin for node: {}", node_name);
                    break;
                }
            }
        }
    });

    // Spawn a thread to handle stdout and stderr
    std::thread::spawn({
        let output = Arc::clone(&output);
        let node_name = node_name.clone();
        let app_handle = app_handle.clone();

        move || {
            let stdout_reader = BufReader::new(stdout);
            let stderr_reader = BufReader::new(stderr);

            let process_line = |line: std::io::Result<String>| -> Result<()> {
                let l =
                    line.map_err(|e| AppError::Custom(format!("Failed to read line: {}", e)))?;
                let cleaned_line = strip_ansi_escapes(&l);

                {
                    let mut output_lock = output
                        .lock()
                        .map_err(|e| AppError::Custom(format!("Failed to lock output: {}", e)))?;
                    output_lock.push_str(&cleaned_line);
                    output_lock.push('\n');
                }
                write_to_log(&app_handle, &node_name, &cleaned_line)
                    .map_err(|e| AppError::Custom(format!("Failed to log output: {}", e)))?;
                app_handle
                    .emit_all(&format!("node-output-{}", node_name), cleaned_line + "\n")
                    .map_err(|e| {
                        AppError::Custom(format!(
                            "Failed to emit output for node {}: {}",
                            node_name, e
                        ))
                    })?;

                Ok(())
            };

            for line in stdout_reader.lines().chain(stderr_reader.lines()) {
                if let Err(e) = process_line(line) {
                    eprintln!("Error processing line for node {}: {}", node_name, e);
                    return Err(AppError::Custom(e.to_string()));
                }
            }
            Ok(())
        }
    });

    let node_process = NodeProcess {
        process: Some(process),
        stdin: Some(tx),
        output,
    };
    manager.nodes.insert(node_name.clone(), node_process);

    Ok(OperationResult {
        success: true,
        message: "Node start command issued. Check the output for status.".to_string(),
    })
}

pub fn get_node_output(state: State<'_, AppState>, node_name: String) -> Result<OperationResult> {
    let manager = state
        .node_manager
        .lock()
        .map_err(|e| AppError::Custom(format!("Failed to lock node manager: {}", e)))?;

    match manager.nodes.get(&node_name) {
        Some(node_process) => {
            let output = node_process
                .output
                .lock()
                .map_err(|e| AppError::Custom(format!("Failed to lock output: {}", e)))?
                .clone();

            Ok(OperationResult {
                success: true,
                message: output,
            })
        }
        None => Ok(OperationResult {
            success: false,
            message: format!("Node not found: {}", node_name),
        }),
    }
}

pub async fn stop_node_process(
    state: State<'_, AppState>,
    node_name: String,
) -> Result<OperationResult> {
    if !is_node_process_running(&node_name) {
        return Ok(OperationResult {
            success: false,
            message: format!("Node '{}' is not running.", node_name),
        });
    }

    let node_stopped = {
        let mut manager = state
            .node_manager
            .lock()
            .map_err(|e| AppError::Custom(format!("Failed to lock node manager: {}", e)))?;
        if let Some(mut node_process) = manager.nodes.remove(&node_name) {
            if let Some(mut process) = node_process.process.take() {
                process.kill().is_ok()
            } else {
                false
            }
        } else {
            false
        }
    };

    if !node_stopped {
        kill_node_process(&node_name)
            .map_err(|e| AppError::Process(format!("Failed to stop node: {}", e)))?;
    }

    let timestamp = Local::now().format("%Y-%m-%dT%H:%M:%S.%6fZ");
    write_to_log(
        &state.app_handle,
        &node_name,
        &format!(
            "{} Node '{}' has been stopped successfully.",
            timestamp, node_name
        ),
    )?;

    Ok(OperationResult {
        success: true,
        message: format!("Node '{}' has been stopped successfully.", node_name),
    })
}

pub fn send_input_to_node(
    node_name: String,
    input: String,
    state: State<'_, AppState>,
) -> Result<String> {
    let manager = state
        .node_manager
        .lock()
        .map_err(|e| AppError::Custom(format!("Failed to lock node manager: {}", e)))?;
    let node_process = manager
        .nodes
        .get(&node_name)
        .ok_or_else(|| AppError::Custom(format!("Node not found: {}", node_name)))?;

    let stdin = node_process
        .stdin
        .as_ref()
        .ok_or_else(|| AppError::Custom(format!("Node is not running: {}", node_name)))?;

    stdin
        .send(input)
        .map_err(|e| AppError::Custom(format!("Failed to send input: {}", e)))?;
    Ok("Input sent successfully".to_string())
}
