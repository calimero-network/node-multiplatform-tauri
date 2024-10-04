use tauri::{AppHandle, State};

use crate::{
    operations::{create_node, get_nodes},
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
pub fn fetch_nodes(app_handle: AppHandle) -> Result<OperationResult<Vec<NodeInfo>>, String> {
    match get_nodes(app_handle) {
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
