use tauri::{AppHandle, State};

use crate::{
    operations::node_operations::{create_node, get_nodes},
    types::types::{AppState, NodeInfo, OperationResult, Result},
};

#[tauri::command]
pub async fn initialize_node(
    state: State<'_, AppState>,
    node_name: String,
    server_port: u32,
    swarm_port: u32,
    run_on_startup: bool,
) -> Result<OperationResult> {
    create_node(state, node_name, server_port, swarm_port, run_on_startup).await
}

#[tauri::command]
pub fn fetch_nodes(app_handle: AppHandle) -> Result<Vec<NodeInfo>> {
    get_nodes(app_handle)
}
