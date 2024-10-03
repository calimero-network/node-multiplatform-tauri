use crate::types::types::{AppState, NodeManager};
use eyre::{eyre, Result};
use std::collections::HashMap;
use std::fs;
use std::sync::{Arc, Mutex};
use tauri::{App, AppHandle, Wry};
use tauri_plugin_store::{Store, StoreBuilder};

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
        nodes: HashMap::new(),
    }));

    Ok(AppState {
        store: Mutex::new(store),
        app_handle,
        node_manager,
    })
}
