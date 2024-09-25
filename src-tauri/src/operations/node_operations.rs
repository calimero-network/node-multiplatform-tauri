use std::{fs, process::Command};

use tauri::{AppHandle, State};

use crate::{
    error::errors::AppError,
    store::store::update_run_node_on_startup,
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

pub fn get_nodes(app_handle: AppHandle) -> Result<Vec<NodeInfo>> {
    let nodes_dir = get_nodes_dir(&app_handle);
    Ok(fs::read_dir(nodes_dir)?
        .filter_map(|entry| {
            let entry = entry.ok()?;
            let node_name = entry.file_name().to_str()?.to_owned();

            get_node_ports(&node_name, &app_handle)
                .map(|config| {
                    let is_running = is_node_process_running(&node_name);
                    NodeInfo {
                        name: node_name,
                        is_running,
                        node_ports: config,
                    }
                })
                .ok()
        })
        .collect())
}