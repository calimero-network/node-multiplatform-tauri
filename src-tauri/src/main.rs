// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, SystemTray, SystemTrayEvent, SystemTrayMenu};
use tray::tray::{handle_tray_click, update_tray_menu};
use utils::setup::{setup_app_state, setup_store};

mod commands;
mod error;
mod logger;
mod operations;
mod store;
mod tray;
mod types;
mod utils;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let system_tray = SystemTray::new().with_menu(SystemTrayMenu::new());
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle();
            // Initialize store
            let store = setup_store(app)?;
            // Initialize app state
            let app_state = setup_app_state(app_handle, store)?;
            app.manage(app_state);

            update_tray_menu(app.state())?;
            Ok(())
        })
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| {
            let app_handle = app.app_handle();
            match event {
                SystemTrayEvent::MenuItemClick { id, .. } => {
                    let _ = handle_tray_click(&app_handle, &id);
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::node_commands::initialize_node,
            commands::node_commands::fetch_nodes,
            commands::node_commands::update_node,
            commands::node_commands::start_node,
            commands::node_commands::get_node_current_output,
            commands::node_commands::stop_node,
            commands::node_commands::send_input,
            commands::node_commands::get_node_log,
        ])
        .run(tauri::generate_context!())?;

    Ok(())
}
