use std::collections::HashMap;
use std::{env, fs};
use std::sync::{Arc, Mutex};
use auto_launch::AutoLaunchBuilder;
use tauri::{App, AppHandle, Manager, State, Wry};
use tauri_plugin_store::{Store, StoreBuilder};
use crate::error::errors::AppError;
use crate::operations::node_operations::start_nodes_on_startup;
use crate::types::types::{AppState, NodeManager, Result as Res};

pub fn setup_store(app: &App) -> Result<Store<Wry>, Box<dyn std::error::Error>> {
    let store_path = app
        .path_resolver()
        .app_data_dir()
        .ok_or("Failed to get app data dir")?
        .join("node_manager.dat");

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

// Run start_nodes_on_startup
pub fn run_nodes_on_startup(state: &State<'_, AppState>) -> Result<(), Box<dyn std::error::Error>> {
   let app_handle_clone = state.app_handle.clone();
   tauri::async_runtime::spawn(async move {
       let state = app_handle_clone.state::<AppState>().clone();
       if let Err(e) = start_nodes_on_startup(state).await {
           eprintln!("Error starting nodes on startup: {:?}", e);
       }
   });
   Ok(())
}

pub fn setup_auto_launch(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
  let app_name = app.package_info().name.clone();
  let exec_path = env::current_exe().map_err(|e| AppError::IoError(e.to_string()))?;
  let app_path = exec_path.to_str().ok_or_else(|| {
      AppError::Custom("Failed to convert executable path to string".to_string())
  })?;

  let auto_launch = AutoLaunchBuilder::new()
      .set_app_name(&app_name)
      .set_app_path(app_path)
      .set_use_launch_agent(true)
      .set_args(&["--hidden"])
      .build()
      .map_err(|e| AppError::Custom(format!("Failed to build AutoLaunch: {}", e)))?;

  auto_launch
      .enable()
      .map_err(|e| AppError::Custom(format!("Failed to enable AutoLaunch: {}", e)))?;

  Ok(())
}

// Add this function to disable auto-launch
pub fn disable_auto_launch(app_handle: &AppHandle) -> Res<()> {
  let app_name = app_handle.package_info().name.clone();
  let exec_path = env::current_exe().map_err(|e| AppError::IoError(e.to_string()))?;
  let app_path = exec_path.to_str().ok_or_else(|| {
      AppError::Custom("Failed to convert executable path to string".to_string())
  })?;
  let auto_launch = AutoLaunchBuilder::new()
      .set_app_name(&app_name)
      .set_app_path(app_path)
      .set_use_launch_agent(true)
      .build()
      .map_err(|e| AppError::Custom(format!("Failed to build AutoLaunch: {}", e)))?;
  auto_launch.disable().map_err(|e| AppError::Custom(format!("Failed to disable AutoLaunch: {}", e)))?;
  Ok(())
}