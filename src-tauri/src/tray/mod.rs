use crate::operations::open_admin_dashboard;
use crate::types::NodeInfo;
use crate::{operations::get_nodes, types::AppState, utils::is_node_process_running};
use eyre::eyre;
use tauri::{
    AppHandle, CustomMenuItem, Manager, State, SystemTrayMenu, SystemTrayMenuItem,
    SystemTraySubmenu,
};

pub mod menu;

pub fn update_tray_menu(state: State<'_, AppState>) -> Result<(), eyre::Report> {
    let app_handle = state.app_handle.clone();
    let nodes = get_nodes(state)?;
    let menu = match nodes.len() {
        0 => build_empty_node_menu()?,
        1 => build_single_node_menu(&app_handle, &nodes[0].name)?,
        _ => build_multi_node_menu(&app_handle, &nodes)?,
    };

    app_handle.tray_handle().set_menu(menu)?;
    Ok(())
}

fn build_single_node_menu(app_handle: &AppHandle, node: &str) -> Result<SystemTrayMenu, eyre::Report> {
    // Initialize status_icon and is_running based on the node's running status
    let (status_icon, is_running) = match is_node_process_running(app_handle, node) {
        Ok(true) => ("🟢", true),
        Ok(false) => ("🔴", false),
        Err(_) => ("⚠️", true),
    };
    let mut menu = SystemTrayMenu::new();
    menu = menu
        .add_item(CustomMenuItem::new(
            format!("show_{}", node),
            format!("{} {}", status_icon, node),
        ))
        .add_native_item(SystemTrayMenuItem::Separator);

    menu = add_node_items(menu, node, is_running)?;

    Ok(menu
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("quit".to_string(), "Quit")))
}

fn build_empty_node_menu() -> Result<SystemTrayMenu, eyre::Report> {
    let no_nodes_item = CustomMenuItem::new("show_window".to_string(), "No nodes available");
    Ok(SystemTrayMenu::new()
        .add_item(no_nodes_item)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("quit".to_string(), "Quit")))
}

fn build_multi_node_menu(app_handle: &AppHandle, nodes: &Vec<NodeInfo>) -> Result<SystemTrayMenu, eyre::Report> {
    let mut menu = SystemTrayMenu::new();

    for node in nodes {
        // Initialize status_icon and is_running based on the node's running status
        let (status_icon, is_running) = match is_node_process_running(app_handle, &node.name) {
            Ok(true) => ("🟢", true),
            Ok(false) => ("🔴", false),
            Err(_) => ("⚠️", true),
        };
        let node_menu = add_node_items(SystemTrayMenu::new(), &node.name, is_running)?;
        menu = menu.add_submenu(SystemTraySubmenu::new(
            format!("{} {}", status_icon, node.name),
            node_menu,
        ));
    }

    Ok(menu
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("quit".to_string(), "Quit")))
}

fn add_node_items(
    menu: SystemTrayMenu,
    node: &str,
    is_running: bool,
) -> Result<SystemTrayMenu, eyre::Report> {
    Ok(menu
        .add_item(CustomMenuItem::new(
            format!("show_{}", node),
            format!("Show {} window", node),
        ))
        .add_item({
            let item = CustomMenuItem::new(format!("start_{}", node), "Start");
            if is_running {
                item.disabled()
            } else {
                item
            }
        })
        .add_item({
            let item = CustomMenuItem::new(format!("stop_{}", node), "Stop");
            if is_running {
                item
            } else {
                item.disabled()
            }
        })
        .add_item({
            let item = CustomMenuItem::new(format!("dashboard_{}", node), "Dashboard");
            if is_running {
                item
            } else {
                item.disabled()
            }
        })
        .add_item(CustomMenuItem::new(format!("config_{}", node), "Configure"))
        .add_item(CustomMenuItem::new(format!("logs_{}", node), "Logs"))
        .add_item(CustomMenuItem::new(format!("delete_{}", node), "Delete")))
}

pub fn handle_tray_click(app_handle: &AppHandle, menu_id: &str) -> Result<(), eyre::Report> {
    let mut parts = menu_id.split('_');
    match (parts.next(), parts.next()) {
        (Some("show"), Some("window")) => show_main_window(app_handle),
        (Some(action), Some(node)) => handle_tray_action(app_handle, action, node),
        (Some("quit"), None) => {
            app_handle.exit(0);
            Ok(())
        }
        _ => Ok(()),
    }
}

pub fn handle_tray_action(
    app_handle: &AppHandle,
    action: &str,
    node: &str,
) -> Result<(), eyre::Report> {
    let window = get_main_window(app_handle)?;

    if matches!(action, "controls" | "configure" | "logs" | "show") {
        window.show()?;
        window.set_focus()?;
    }

    match action {
        "start" | "stop" => emit_trigger_action(&window, node, "controls", action)?,
        "config" | "logs" | "delete" => emit_trigger_action(&window, node, action, "")?,
        "show" => emit_trigger_action(&window, node, "", "show")?,
        "dashboard" => {
            open_admin_dashboard(app_handle.clone(), node.to_string())?;
        }
        _ => {}
    }

    Ok(())
}

fn get_main_window(app_handle: &AppHandle) -> Result<tauri::Window, eyre::Report> {
    app_handle
        .get_window("main")
        .ok_or_else(|| eyre!("Main window not found"))
}

fn show_main_window(app_handle: &AppHandle) -> Result<(), eyre::Report> {
    let window = get_main_window(app_handle)?;
    window.show()?;
    window.set_focus()?;
    Ok(())
}

fn emit_trigger_action(
    window: &tauri::Window,
    node: &str,
    section: &str,
    action: &str,
) -> Result<(), eyre::Report> {
    window.emit(
        "trigger-action",
        serde_json::json!({
            "nodeName": node,
            "section": section,
            "action": action
        }),
    )?;
    Ok(())
}
