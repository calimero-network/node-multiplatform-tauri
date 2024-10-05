use eyre::{eyre, Result};
use multiaddr::{Multiaddr, Protocol};
use serde_json::Value;
use std::{fs, process::Command};
use tauri::State;

use crate::{
    store::{get_run_node_on_startup, update_run_node_on_startup},
    types::{AppState, NodeInfo},
    utils::{get_binary_path, get_node_ports, get_nodes_dir, is_node_process_running},
};

pub async fn create_node(
    state: State<'_, AppState>,
    node_name: String,
    server_port: u32,
    swarm_port: u32,
    run_on_startup: bool,
) -> Result<bool, eyre::Error> {
    let nodes_dir = get_nodes_dir(&state.app_handle);
    fs::create_dir_all(&nodes_dir).map_err(|e| eyre!("Failed to create nodes directory: {}", e))?;

    let binary_path = get_binary_path(&state.app_handle)?;
    let output = Command::new(binary_path)
        .args(&[
            "--node-name",
            &node_name,
            "--home",
            nodes_dir
                .to_str()
                .ok_or_else(|| eyre!("Failed to convert path to string"))?,
            "init",
            "--server-port",
            &server_port.to_string(),
            "--swarm-port",
            &swarm_port.to_string(),
        ])
        .output()
        .map_err(|e| eyre!("Failed to execute command: {}", e))?;

    if !output.status.success() {
        return Ok(false);
    }

    update_run_node_on_startup(&state, &node_name, run_on_startup)?;

    Ok(true)
}

pub fn get_nodes(state: State<'_, AppState>) -> Result<Vec<NodeInfo>> {
    let nodes_dir = get_nodes_dir(&state.app_handle);
    let mut nodes = Vec::new();
    for entry in
        fs::read_dir(nodes_dir).map_err(|e| eyre!("Failed to read nodes directory: {}", e))?
    {
        let entry = entry.map_err(|e| eyre!("Failed to read directory entry: {}", e))?;
        if let Some(node_name) = entry.file_name().to_str() {
            let node_name = node_name.to_owned();
            if let Ok(config) = get_node_ports(&node_name, &state.app_handle) {
                let is_running = is_node_process_running(&node_name)?;
                let run_on_startup = get_run_node_on_startup(&state, &node_name)?;
                nodes.push(NodeInfo {
                    name: node_name,
                    is_running,
                    run_on_startup,
                    node_ports: config,
                });
            }
        }
    }

    Ok(nodes)
}

pub async fn update_node_config(
    state: State<'_, AppState>,
    original_node_name: String,
    node_name: String,
    server_port: u32,
    swarm_port: u32,
    run_on_startup: bool,
) -> Result<bool> {
    let nodes_dir = get_nodes_dir(&state.app_handle);
    let original_node_dir = nodes_dir.join(&original_node_name);
    let new_node_dir = nodes_dir.join(&node_name);

    // Check if the new node name is already taken
    if original_node_name != node_name && new_node_dir.exists() {
        return Err(eyre!("Cannot change node name, node with name {} already exists", node_name));
    }

    // Read the config file
    let config_path = original_node_dir.join("config.toml");
    let config_content = fs::read_to_string(&config_path)
        .map_err(|e| eyre!("Failed to read config file: {}", e))?;

    let mut config: Value = toml::from_str(&config_content)
        .map_err(|e| eyre!("Failed to parse config file: {}", e))?;

    // Update the "swarm" and "server" sections
    update_port(&mut config, "swarm", &swarm_port.to_string())
        .map_err(|e| eyre!("Failed to update swarm port: {}", e))?;
    update_port(&mut config, "server", &server_port.to_string())
        .map_err(|e| eyre!("Failed to update server port: {}", e))?;

    // Serialize the updated config back to TOML
    let updated_content = toml::to_string(&config)
        .map_err(|e| eyre!("Failed to serialize config: {}", e))?;

    // Write the updated content back to the file
    fs::write(&config_path, updated_content)
        .map_err(|e| eyre!("Failed to write updated config: {}", e))?;

    // Rename the node directory if the name has changed
    if original_node_name != node_name {
        fs::rename(&original_node_dir, &new_node_dir)
            .map_err(|e| eyre!("Failed to rename node directory: {}", e))?;
    }

    update_run_node_on_startup(&state, &node_name, run_on_startup)
        .map_err(|e| eyre!("Failed to update option to run node on startup: {}", e))?;

    Ok(true)
}

// Helper function to update port numbers
fn update_port(config: &mut Value, section: &str, new_port: &str) -> Result<()> {
    if let Some(listen) = config[section]["listen"].as_array_mut() {
        for entry in listen.iter_mut() {
            if let Some(s) = entry.as_str() {
                let new_value = change_port_in_path(s, new_port)?;
                *entry = Value::String(new_value);
            }
        }
    }
    Ok(())
}

// Helper function to change the port in the path-like string
fn change_port_in_path(address: &str, new_port: &str) -> Result<String> {
    // Parse the address into a Multiaddr
    let multiaddr: Multiaddr = address
        .parse()
        .map_err(|e| eyre!("Invalid multiaddr format: {}", e))?;

    // Iterate over the protocols and replace the port
    let mut new_multiaddr = Multiaddr::empty();
    for protocol in multiaddr.iter() {
        match protocol {
            Protocol::Tcp(_) => {
                let port = new_port
                    .parse()
                    .map_err(|e| eyre!("Invalid port number: {}", e))?;
                new_multiaddr.push(Protocol::Tcp(port));
            }
            Protocol::Udp(_) => {
                let port = new_port
                    .parse()
                    .map_err(|e| eyre!("Invalid port number: {}", e))?;
                new_multiaddr.push(Protocol::Udp(port));
            }
            _ => new_multiaddr.push(protocol),
        }
    }

    // Convert the modified Multiaddr back to a string
    Ok(new_multiaddr.to_string())
}
