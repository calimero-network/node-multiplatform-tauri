use crate::logger::get_node_log_file;
use crate::types::{AppState, NodeManager, NodeProcess};
use eyre::{eyre, Result};
use std::collections::HashMap;
use std::fs;
use std::sync::{Arc, Mutex};
use tauri::{App, AppHandle, Wry};
use tauri_plugin_store::{Store, StoreBuilder};

use crate::utils::get_nodes_dir;

pub fn setup_store(app: &App) -> Result<Store<Wry>> {
    let app_data_dir = app
        .path_resolver()
        .app_data_dir()
        .ok_or_else(|| eyre!("Failed to get app data dir"))?;

    if !app_data_dir.exists() {
        fs::create_dir_all(&app_data_dir)
            .map_err(|e| eyre!("Failed to create app data directory: {}", e))?;
    }

    let store_path = app_data_dir.join("node_manager.dat");
    if !store_path.exists() {
        fs::write(&store_path, "{}").map_err(|e| eyre!("Failed to create store file: {}", e))?;
    }

    let mut store: Store<Wry> = StoreBuilder::new(app.handle(), store_path).build();
    store
        .load()
        .map_err(|e| eyre!("Failed to load store: {}", e))?;

    Ok(store)
}

pub fn setup_app_state(app_handle: AppHandle, store: Store<Wry>) -> Result<AppState> {
    let node_manager = Arc::new(Mutex::new(NodeManager {
        nodes: load_nodes(&app_handle)?,
    }));

    Ok(AppState {
        store: Mutex::new(store),
        app_handle,
        node_manager,
    })
}

fn load_nodes(app_handle: &AppHandle) -> Result<HashMap<String, NodeProcess>> {
    let mut nodes = HashMap::new();

    let nodes_dir = get_nodes_dir(app_handle);
    if !nodes_dir.exists() {
        return Ok(HashMap::new());
    }

    // Iterate over the directory entries
    for entry in fs::read_dir(nodes_dir)? {
        let entry = entry?;
        let path = entry.path();

        // Check if the entry is a directory
        if path.is_dir() {
            if let Some(node_name) = path.file_name().and_then(|name| name.to_str()) {
                let log_file = get_node_log_file(app_handle, node_name)?;

                nodes.insert(
                    node_name.to_string(),
                    NodeProcess {
                        process: None, // Not running initially
                        stdin: None,
                        output: Arc::new(Mutex::new(String::new())),
                        log_file: Some(log_file),
                    },
                );
            }
        }
    }

    Ok(nodes)
}
