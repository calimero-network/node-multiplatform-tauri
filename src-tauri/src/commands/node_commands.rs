use tauri::State;

use crate::{
    logger::logger::read_log_file,
    operations::node_operations::{
        create_node, delete_node as delete_node_operation, get_node_output, get_nodes,
        open_admin_dashboard, send_input_to_node, start_node as start, stop_node_process,
        update_node_config,
    },
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
pub fn fetch_nodes(state: State<'_, AppState>) -> Result<Vec<NodeInfo>> {
    get_nodes(state)
}

#[tauri::command]
pub async fn update_node(
    state: State<'_, AppState>,
    original_node_name: String,
    node_name: String,
    server_port: u32,
    swarm_port: u32,
    run_on_startup: bool,
) -> Result<OperationResult> {
    update_node_config(
        state,
        original_node_name,
        node_name,
        server_port,
        swarm_port,
        run_on_startup,
    )
    .await
}

#[tauri::command]
pub async fn start_node(state: State<'_, AppState>, node_name: String) -> Result<OperationResult> {
    start(state, node_name).await
}

#[tauri::command]
pub async fn get_node_current_output(
    state: State<'_, AppState>,
    node_name: String,
) -> Result<OperationResult> {
    get_node_output(state, node_name)
}

#[tauri::command]
pub async fn stop_node(state: State<'_, AppState>, node_name: String) -> Result<OperationResult> {
    stop_node_process(state, node_name).await
}

#[tauri::command]
pub async fn send_input(
    node_name: String,
    input: String,
    state: State<'_, AppState>,
) -> Result<String> {
    send_input_to_node(node_name, input, state)
}

#[tauri::command]
pub async fn get_node_log(state: State<'_, AppState>, node_name: String) -> Result<String> {
    read_log_file(state, &node_name)
}

#[tauri::command]
pub async fn delete_node(state: State<'_, AppState>, node_name: String) -> Result<OperationResult> {
    delete_node_operation(state, node_name).await
}

#[tauri::command]
pub async fn open_dashboard(
    state: State<'_, AppState>,
    node_name: String,
) -> Result<OperationResult> {
    open_admin_dashboard(state.app_handle.clone(), node_name)
}
