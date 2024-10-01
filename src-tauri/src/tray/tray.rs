use crate::error::errors::AppError;
use crate::operations::node_operations::{open_admin_dashboard, stop_all_nodes};
use crate::types::types::NodeInfo;
use crate::{
    operations::node_operations::get_nodes,
    types::types::{AppState, Result},
    utils::utils::is_node_process_running,
};
use tauri::{
    AppHandle, CustomMenuItem, Manager, State, SystemTrayMenu, SystemTrayMenuItem,
    SystemTraySubmenu,
};

pub fn update_tray_menu(state: State<'_, AppState>) -> Result<()> {
    let app_handle = state.app_handle.clone();
    let nodes = get_nodes(state)?;
    let menu = match nodes.len() {
        0 => build_empty_node_menu(),
        1 => build_single_node_menu(&nodes[0].name),
        _ => build_multi_node_menu(&nodes),
    };

    app_handle.tray_handle().set_menu(menu)?;
    Ok(())
}

fn build_single_node_menu(node: &str) -> SystemTrayMenu {
    let is_running = is_node_process_running(node);
    let status_icon = if is_running { "🟢" } else { "🔴" };

    let mut menu = SystemTrayMenu::new();
    menu = menu
        .add_item(CustomMenuItem::new(
            format!("show_{}", node),
            format!("{} {}", status_icon, node),
        ))
        .add_native_item(SystemTrayMenuItem::Separator);

    menu = add_node_items(menu, node, is_running);

    menu.add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("quit".to_string(), "Quit"))
}

fn build_empty_node_menu() -> SystemTrayMenu {
    let no_nodes_item = CustomMenuItem::new("show_window".to_string(), "No nodes available");
    SystemTrayMenu::new()
        .add_item(no_nodes_item)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("quit".to_string(), "Quit"))
}

fn build_multi_node_menu(nodes: &Vec<NodeInfo>) -> SystemTrayMenu {
    let mut menu = SystemTrayMenu::new();

    for node in nodes {
        let is_running = is_node_process_running(&node.name);
        let status_icon = if is_running { "🟢" } else { "🔴" };
        let node_menu = add_node_items(SystemTrayMenu::new(), &node.name, is_running);
        menu = menu.add_submenu(SystemTraySubmenu::new(
            format!("{} {}", status_icon, node.name),
            node_menu,
        ));
    }

    menu.add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("quit".to_string(), "Quit"))
}

fn add_node_items(menu: SystemTrayMenu, node: &str, is_running: bool) -> SystemTrayMenu {
    menu.add_item(CustomMenuItem::new(
        format!("show_{}", node),
        format!("Show {} window", node),
    ))
    .add_item(if is_running {
        CustomMenuItem::new(format!("start_{}", node), "Start").disabled()
    } else {
        CustomMenuItem::new(format!("start_{}", node), "Start")
    })
    .add_item(if is_running {
        CustomMenuItem::new(format!("stop_{}", node), "Stop")
    } else {
        CustomMenuItem::new(format!("stop_{}", node), "Stop").disabled()
    })
    .add_item(if is_running {
        CustomMenuItem::new(format!("dashboard_{}", node), "Dashboard")
    } else {
        CustomMenuItem::new(format!("dashboard_{}", node), "Dashboard").disabled()
    })
    .add_item(CustomMenuItem::new(format!("config_{}", node), "Configure"))
    .add_item(CustomMenuItem::new(format!("logs_{}", node), "Logs"))
    .add_item(CustomMenuItem::new(format!("delete_{}", node), "Delete"))
}

pub async fn handle_tray_click(app_handle: &AppHandle, menu_id: &str) -> Result<()> {
    let parts: Vec<&str> = menu_id.split('_').collect();
    match parts.as_slice() {
        ["show", "window"] => show_main_window(app_handle),
        [action, node] => handle_tray_action(app_handle, action, node),
        ["quit"] => {
            stop_all_nodes(app_handle.state::<AppState>().clone()).await?;
            app_handle.exit(0);
            Ok(())
        }
        _ => Ok(()),
    }
}

pub fn handle_tray_action(app_handle: &AppHandle, action: &str, node: &str) -> Result<()> {
    let window = get_main_window(app_handle)?;

    if ["controls", "configure", "logs", "show"].contains(&action) {
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

fn get_main_window(app_handle: &AppHandle) -> Result<tauri::Window> {
    app_handle
        .get_window("main")
        .ok_or_else(|| AppError::Custom("Main window not found".to_string()))
}

fn show_main_window(app_handle: &AppHandle) -> Result<()> {
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
) -> Result<()> {
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
