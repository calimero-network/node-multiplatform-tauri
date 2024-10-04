use eyre::{eyre, Result};
use std::{fs, process::Command};
use tauri::{AppHandle, State};

use crate::{
    store::update_run_node_on_startup,
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

pub fn get_nodes(app_handle: AppHandle) -> Result<Vec<NodeInfo>> {
    let nodes_dir = get_nodes_dir(&app_handle);
    let mut nodes = Vec::new();
    for entry in
        fs::read_dir(nodes_dir).map_err(|e| eyre!("Failed to read nodes directory: {}", e))?
    {
        let entry = entry.map_err(|e| eyre!("Failed to read directory entry: {}", e))?;
        if let Some(node_name) = entry.file_name().to_str() {
            let node_name = node_name.to_owned();
            if let Ok(config) = get_node_ports(&node_name, &app_handle) {
                let is_running = is_node_process_running(&node_name)?;
                nodes.push(NodeInfo {
                    name: node_name,
                    is_running,
                    node_ports: config,
                });
            }
        }
    }

    Ok(nodes)
}
