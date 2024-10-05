use tauri::State;

use crate::{
    logger::read_log_file,
    operations::{
        create_node, get_node_output, get_nodes, send_input_to_node, start_node as start,
        stop_node_process, update_node_config,
    },
    types::{AppState, NodeInfo, OperationResult},
};

#[tauri::command]
pub async fn initialize_node(
    state: State<'_, AppState>,
    node_name: String,
    server_port: u32,
    swarm_port: u32,
    run_on_startup: bool,
) -> Result<OperationResult, String> {
    match create_node(state, node_name, server_port, swarm_port, run_on_startup).await {
        Ok(true) => Ok(OperationResult {
            success: true,
            message: "Node initialized successfully".to_string(),
            data: None,
        }),
        Ok(false) => Ok(OperationResult {
            success: false,
            message: "Node initialization failed".to_string(),
            data: None,
        }),
        Err(e) => Ok(OperationResult {
            success: false,
            message: e.to_string(),
            data: None,
        }),
    }
}

#[tauri::command]
pub fn fetch_nodes(state: State<'_, AppState>) -> Result<OperationResult<Vec<NodeInfo>>, String> {
    match get_nodes(state) {
        Ok(nodes) => Ok(OperationResult {
            success: true,
            message: "Nodes fetched successfully".to_string(),
            data: Some(nodes),
        }),
        Err(e) => Ok(OperationResult {
            success: false,
            message: e.to_string(),
            data: None,
        }),
    }
}

#[tauri::command]
pub async fn update_node(
    state: State<'_, AppState>,
    original_node_name: String,
    node_name: String,
    server_port: u32,
    swarm_port: u32,
    run_on_startup: bool,
) -> Result<OperationResult, String> {
    match update_node_config(
        state,
        original_node_name,
        node_name,
        server_port,
        swarm_port,
        run_on_startup,
    )
    .await
    {
        Ok(true) => Ok(OperationResult {
            success: true,
            message: "Node updated successfully".to_string(),
            data: None,
        }),
        Ok(false) => Ok(OperationResult {
            success: false,
            message: "Node update failed".to_string(),
            data: None,
        }),
        Err(e) => Ok(OperationResult {
            success: false,
            message: e.to_string(),
            data: None,
        }),
    }
}

#[tauri::command]
pub async fn start_node(
    state: State<'_, AppState>,
    node_name: String,
) -> Result<OperationResult, String> {
    match start(state, node_name).await {
        Ok(true) => Ok(OperationResult {
            success: true,
            message: "Node started successfully".to_string(),
            data: None,
        }),
        Ok(false) => Ok(OperationResult {
            success: false,
            message: "Node start failed".to_string(),
            data: None,
        }),
        Err(e) => Ok(OperationResult {
            success: false,
            message: e.to_string(),
            data: None,
        }),
    }
}

#[tauri::command]
pub async fn get_node_current_output(
    state: State<'_, AppState>,
    node_name: String,
) -> Result<OperationResult<String>, String> {
    match get_node_output(state, node_name) {
        Ok(output) => Ok(OperationResult {
            success: true,
            message: "Node output fetched successfully".to_string(),
            data: Some(output),
        }),
        Err(e) => Ok(OperationResult {
            success: false,
            message: e.to_string(),
            data: None,
        }),
    }
}

#[tauri::command]
pub async fn stop_node(
    state: State<'_, AppState>,
    node_name: String,
) -> Result<OperationResult, String> {
    match stop_node_process(state, node_name).await {
        Ok(true) => Ok(OperationResult {
            success: true,
            message: "Node stopped successfully".to_string(),
            data: None,
        }),
        Ok(false) => Ok(OperationResult {
            success: false,
            message: "Node stop failed".to_string(),
            data: None,
        }),
        Err(e) => Ok(OperationResult {
            success: false,
            message: e.to_string(),
            data: None,
        }),
    }
}

#[tauri::command]
pub async fn send_input(
    node_name: String,
    input: String,
    state: State<'_, AppState>,
) -> Result<OperationResult, String> {
    match send_input_to_node(node_name, input, state) {
        Ok(true) => Ok(OperationResult {
            success: true,
            message: "Input sent successfully".to_string(),
            data: None,
        }),
        Ok(false) => Ok(OperationResult {
            success: false,
            message: "Input sending failed".to_string(),
            data: None,
        }),
        Err(e) => Ok(OperationResult {
            success: false,
            message: e.to_string(),
            data: None,
        }),
    }
}

#[tauri::command]
pub async fn get_node_log(
    state: State<'_, AppState>,
    node_name: String,
) -> Result<OperationResult<String>, String> {
    match read_log_file(state, &node_name) {
        Ok(log) => Ok(OperationResult {
            success: true,
            message: "Node log fetched successfully".to_string(),
            data: Some(log),
        }),
        Err(e) => Ok(OperationResult {
            success: false,
            message: e.to_string(),
            data: None,
        }),
    }
}
