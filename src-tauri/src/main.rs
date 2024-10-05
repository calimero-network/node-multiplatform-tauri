// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use node_multiplatform_tauri::commands;
use node_multiplatform_tauri::utils::setup::{setup_app_state, setup_store};
use tauri::Manager;

fn main() -> eyre::Result<()> {
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
            commands::update_node,
            commands::initialize_node,
            commands::fetch_nodes,
        ])
        .run(tauri::generate_context!())?;

    Ok(())
}
