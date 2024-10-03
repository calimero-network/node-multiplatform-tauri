use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::process::Child;
use std::sync::mpsc::Sender;
use std::sync::{Arc, Mutex};
use tauri_plugin_store::Store;

pub struct NodeProcess {
    pub process: Option<Child>,
    pub stdin: Option<Sender<String>>,
    pub output: Arc<Mutex<String>>,
}

pub struct NodeManager {
    pub nodes: HashMap<String, NodeProcess>,
}

pub struct AppState {
    pub node_manager: Arc<Mutex<NodeManager>>,
    pub app_handle: tauri::AppHandle,
    pub store: Mutex<Store<tauri::Wry>>,
}

#[derive(Serialize, Debug)]
pub struct OperationResult<T = ()> {
    pub success: bool,
    pub message: String,
    pub data: Option<T>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NodeInfo {
    pub name: String,
    pub is_running: bool,
    pub node_ports: NodeConfig,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NodeConfig {
    pub server_port: u16,
    pub swarm_port: u16,
}
