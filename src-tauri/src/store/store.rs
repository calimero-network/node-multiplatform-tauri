use tauri::State;

use crate::{
    error::errors::AppError,
    types::types::{AppState, Result},
};

pub fn update_run_node_on_startup(
    state: &State<'_, AppState>,
    node_name: &str,
    run_on_startup: bool,
) -> Result<()> {
    let store_lock = state.store.lock();
    if let Ok(mut store) = store_lock {
        store
            .insert(
                format!("{}_run_on_startup", node_name),
                serde_json::json!(run_on_startup),
            )
            .map_err(|e| AppError::Store(e.to_string()))?;
        store.save().map_err(|e| AppError::Store(e.to_string()))?;
        Ok(())
    } else {
        return Err(AppError::Custom("Failed to acquire store lock".into()));
    }
}

pub fn get_run_node_on_startup(state: &State<'_, AppState>, node_name: &str) -> Result<bool> {
    let store = state
        .store
        .lock()
        .map_err(|e| AppError::Store(e.to_string()))?;
    Ok(store
        .get(&format!("{}_run_on_startup", node_name))
        .and_then(|value| value.as_bool())
        .unwrap_or(false))
}
