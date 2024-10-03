use crate::types::types::AppState;
use eyre::{eyre, Result};
use tauri::State;

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
            .map_err(|e| eyre!("Failed to insert into store: {}", e))?;
        store
            .save()
            .map_err(|e| eyre!("Failed to save store: {}", e))?;
        Ok(())
    } else {
        Err(eyre!("Failed to acquire store lock"))
    }
}
