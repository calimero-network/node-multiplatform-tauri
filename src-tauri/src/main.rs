// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, SystemTray, SystemTrayEvent, SystemTrayMenu};
use tray::{menu::{create_menu, handle_menu_click}, tray::{handle_tray_click, update_tray_menu}};
use types::types::AppState;
use utils::setup::{run_nodes_on_startup, setup_app_state, setup_auto_launch, setup_store};

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
    // Create a default menu first
    let menu = create_menu();

    tauri::Builder::default()
        .menu(menu)
        .setup(|app| {
            let app_handle = app.handle();
            // Initialize store
            let store = setup_store(app)?;
            
            // Get the run_app_on_startup value from the store
            let run_app_on_startup = store.get("run_app_on_startup")
                .and_then(|value| value.as_bool())
                .unwrap_or(true);
            
            // Update the menu item state if necessary
            if run_app_on_startup {
                app.windows().values().for_each(|window| {
                    let _ = window.menu_handle().get_item("run_on_startup").set_selected(true);
                });
                setup_auto_launch(&app_handle)?
            }

            // Initialize app state
            let app_state = setup_app_state(app_handle, store)?;
            app.manage(app_state);

            // Get a reference to the managed state
            let state = app.state::<AppState>();

            //Start nodes that have automatic start option selected
            run_nodes_on_startup(&state)?;

            update_tray_menu(app.state())?;
            Ok(())
        })
        .on_menu_event(|event| {
            handle_menu_click(&event);
        })
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| {
            let app_handle = app.app_handle();
            match event {
                SystemTrayEvent::MenuItemClick { id, .. } => {
                    let app_handle_clone = app_handle.clone();
                    tauri::async_runtime::spawn(async move {
                        if let Err(e) = handle_tray_click(&app_handle_clone, &id).await {
                            eprintln!("Error handling tray click: {:?}", e);
                        }
                    });
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
            commands::node_commands::delete_node,
            commands::node_commands::open_dashboard,
        ])
        .run(tauri::generate_context!())?;

    Ok(())
}
