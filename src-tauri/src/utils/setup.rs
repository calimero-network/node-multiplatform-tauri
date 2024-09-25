use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::{env, fs};
use tauri::{App, AppHandle, Wry};
use tauri_plugin_store::{Store, StoreBuilder};

use crate::types::types::{AppState, NodeManager};

pub fn setup_store(app: &App) -> Result<Store<Wry>, Box<dyn std::error::Error>> {
    let store_path: PathBuf;
    #[cfg(debug_assertions)]
    {
        store_path = env::current_dir()?.join("node_manager.dat");
    }

    #[cfg(not(debug_assertions))]
    {
        store_path = app
            .path_resolver()
            .app_data_dir()
            .ok_or("Failed to get app data dir")?
            .join("node_manager.dat");
    }

    if !store_path.exists() {
        fs::write(&store_path, "{}")?;
    }

    let mut store: Store<Wry> = StoreBuilder::new(app.handle(), store_path).build();
    store.load()?;

    Ok(store)
}

pub fn setup_app_state(
    app_handle: AppHandle,
    store: Store<Wry>,
) -> Result<AppState, Box<dyn std::error::Error>> {
    let node_manager = Arc::new(Mutex::new(NodeManager {
        nodes: HashMap::new(),
    }));

    Ok(AppState {
        store: Mutex::new(store),
        app_handle,
        node_manager,
    })
}
