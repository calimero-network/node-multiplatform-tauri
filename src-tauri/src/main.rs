// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use utils::setup::{setup_app_state, setup_store};

mod commands;
mod error;
mod operations;
mod store;
mod types;
mod utils;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle();
            // Initialize store
            let store = setup_store(app)?;
            // Initialize app state
            let app_state = setup_app_state(app_handle, store)?;
            app.manage(app_state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::node_commands::initialize_node,
            commands::node_commands::fetch_nodes,
            commands::node_commands::update_node,
            commands::node_commands::start_node,
            commands::node_commands::get_node_current_output,
            commands::node_commands::stop_node,
            commands::node_commands::send_input,
        ])
        .run(tauri::generate_context!())?;

    Ok(())
}
