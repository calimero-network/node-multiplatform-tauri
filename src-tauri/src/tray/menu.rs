use eyre::eyre;
use tauri::{CustomMenuItem, Manager, Menu, MenuItem, Submenu, WindowMenuEvent};

use crate::{
    operations::stop_all_nodes,
    types::AppState,
    utils::setup::{disable_auto_launch, setup_auto_launch},
};

pub fn create_menu() -> Menu {
    // Create the "Run on Startup" menu item with initial state
    let run_on_startup_menu_item = CustomMenuItem::new("run_on_startup", "Run on Startup");
    let quit_app_menu_item = CustomMenuItem::new("quit", "Quit Calimero Node Manager");

    // Create the Edit submenu
    let edit_menu = Submenu::new(
        "Edit",
        Menu::new()
            .add_native_item(MenuItem::Undo)
            .add_native_item(MenuItem::Redo)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Cut)
            .add_native_item(MenuItem::Copy)
            .add_native_item(MenuItem::Paste)
            .add_native_item(MenuItem::SelectAll),
    );

    // Create the main menu
    let menu = Menu::new()
        .add_submenu(Submenu::new(
            "Calimero Node Manager",
            Menu::new()
                .add_item(run_on_startup_menu_item)
                .add_native_item(MenuItem::Separator)
                .add_item(quit_app_menu_item),
        ))
        .add_submenu(edit_menu);

    menu
}

pub fn handle_menu_click(event: &WindowMenuEvent) -> Result<(), eyre::Report> {
    let app_handle = event.window().app_handle();

    match event.menu_item_id() {
        "run_on_startup" => {
            let app_state = app_handle.state::<AppState>();
            let mut store = app_state.store.lock().unwrap();

            // Toggle the run_app_on_startup value
            let current_value = store
                .get("run_app_on_startup")
                .and_then(|value| value.as_bool())
                .unwrap_or(false);
            let new_value = !current_value;
            if new_value {
                setup_auto_launch(&app_handle)
                    .map_err(|e| eyre!("Failed to setup auto launch: {}", e))?;
            } else {
                disable_auto_launch(&app_handle)
                    .map_err(|e| eyre!("Failed to disable auto launch: {}", e))?;
            }
            // Update the store
            store
                .insert("run_app_on_startup".to_string(), new_value.into())
                .map_err(|e| eyre!("Failed to update store: {}", e))?;
            store
                .save()
                .map_err(|e| eyre!("Failed to save store: {}", e))?;

            // Update the menu item state
            event
                .window()
                .menu_handle()
                .get_item("run_on_startup")
                .set_selected(new_value)
                .map_err(|e| eyre!("Failed to update menu item state: {}", e))?;
        }
        "quit" => {
            // Stop all nodes and exit the application
            let app_handle = app_handle.clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = stop_all_nodes(app_handle.state::<AppState>()).await {
                    eprintln!("Failed to stop all nodes: {}", e);
                }
                app_handle.exit(0);
            });
        }
        _ => {}
    }
    Ok(())
}
