// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use node_multiplatform_tauri::commands;
use node_multiplatform_tauri::tray::{handle_tray_click, update_tray_menu};
use node_multiplatform_tauri::utils::setup::{setup_app_state, setup_store};
use tauri::{Manager, SystemTray, SystemTrayEvent, SystemTrayMenu};

fn main() -> eyre::Result<()> {
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
            commands::initialize_node,
            commands::fetch_nodes,
            commands::update_node,
            commands::start_node,
            commands::get_node_current_output,
            commands::stop_node,
            commands::send_input,
            commands::get_node_log,
            commands::delete_node,
            commands::open_dashboard,
        ])
        .run(tauri::generate_context!())?;

    Ok(())
}
