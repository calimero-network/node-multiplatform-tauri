// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use node_multiplatform_tauri::commands;
use node_multiplatform_tauri::tray::menu::{create_menu, handle_menu_click};
use node_multiplatform_tauri::tray::{handle_tray_click, update_tray_menu};
use node_multiplatform_tauri::types::AppState;
use node_multiplatform_tauri::utils::setup::{
    run_nodes_on_startup, setup_app_state, setup_auto_launch, setup_store,
};
use tauri::{Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, WindowEvent};
// use tray::{menu::{create_menu, handle_menu_click}, tray::{handle_tray_click, update_tray_menu}};

fn main() -> eyre::Result<()> {
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
            let run_app_on_startup = store
                .get("run_app_on_startup")
                .and_then(|value| value.as_bool())
                .unwrap_or(true);

            // Update the menu item state if necessary
            if run_app_on_startup {
                app.windows().values().for_each(|window| {
                    let _ = window
                        .menu_handle()
                        .get_item("run_on_startup")
                        .set_selected(true);
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
            if let Err(e) = handle_menu_click(&event) {
                eprintln!("Error handling menu click: {:?}", e);
            }
        })
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| {
            let app_handle = app.app_handle();
            match event {
                SystemTrayEvent::MenuItemClick { id, .. } => {
                    let app_handle_clone = app_handle.clone();
                    tauri::async_runtime::spawn(async move {
                        if let Err(e) = handle_tray_click(&app_handle_clone, &id) {
                            eprintln!("Error handling tray click: {:?}", e);
                        }
                    });
                }
                _ => {}
            }
        })
        .on_window_event(|event| {
            if let WindowEvent::CloseRequested { api, .. } = event.event() {
                // Prevent the window from closing
                api.prevent_close();
                // Optionally, hide the window instead of closing
                event.window().hide().unwrap();
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
