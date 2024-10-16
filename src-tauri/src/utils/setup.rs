use crate::logger::get_node_log_file;
use crate::operations::start_nodes_on_startup;
use crate::types::{AppState, NodeManager, NodeProcess};
use crate::utils::get_nodes_dir;
use auto_launch::AutoLaunch;
use eyre::{eyre, Result};
use lazy_static::lazy_static;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::{env, fs};
use tauri::{App, AppHandle, Manager, State, Wry};
use tauri_plugin_store::{Store, StoreBuilder};

lazy_static! {
    static ref AUTO_LAUNCH: Mutex<Option<AutoLaunch>> = Mutex::new(None);
}

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

// Run start_nodes_on_startup
pub fn run_nodes_on_startup(state: &State<'_, AppState>) -> Result<(), Box<dyn std::error::Error>> {
    let app_handle_clone = state.app_handle.clone();
    tauri::async_runtime::spawn(async move {
        let state: State<'_, AppState> = app_handle_clone.state::<AppState>().clone();
        if let Err(e) = start_nodes_on_startup(state).await {
            eprintln!("Error starting nodes on startup: {:?}", e);
        }
    });
    Ok(())
}

pub fn setup_auto_launch(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    get_auto_launch(app)?.enable()?;
    Ok(())
}

pub fn disable_auto_launch(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    get_auto_launch(app)?.disable()?;
    Ok(())
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
                        process: None,
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

fn get_auto_launch(app: &AppHandle) -> Result<AutoLaunch, Box<dyn std::error::Error>> {
    let mut auto_launch = AUTO_LAUNCH
        .lock()
        .map_err(|e| eyre!("Failed to lock AutoLaunch: {}", e))?;

    if auto_launch.is_none() {
        let app_name = app.package_info().name.clone();
        let exec_path =
            env::current_exe().map_err(|e| eyre!("Failed to get executable path: {}", e))?;
        let app_path = exec_path
            .to_str()
            .ok_or("Failed to convert executable path to string")?;

        #[cfg(target_os = "linux")]
        {
            *auto_launch = Some(AutoLaunch::new(&app_name, app_path, &[] as &[&str]));
        }

        #[cfg(not(target_os = "linux"))]
        {
            *auto_launch = Some(AutoLaunch::new(&app_name, app_path, true, &[] as &[&str]));
        }
    }

    Ok(auto_launch.as_ref().unwrap().clone())
}
