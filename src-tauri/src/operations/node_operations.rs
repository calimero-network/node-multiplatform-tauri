use std::{fs, process::Command};

use serde_json::Value;
use tauri::{AppHandle, State};

use crate::{
    error::errors::AppError,
    store::store::{get_run_node_on_startup, update_run_node_on_startup},
    types::types::{AppState, NodeInfo, OperationResult, Result},
    utils::utils::{
        get_binary_path, get_node_ports, get_nodes_dir, is_node_process_running, strip_ansi_escapes,
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
        let node_name = entry.file_name().to_str().ok_or(AppError::Custom("Failed to convert path to string".to_string()))?.to_owned();

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