use lazy_static::lazy_static;
use serde_json::Value;
use std::net::{SocketAddr, TcpStream};
use std::path::PathBuf;
use std::process::Command;
use std::time::Duration;
use std::{env, fs};
use tauri::regex::Regex;
use tauri::AppHandle;

use crate::error::errors::AppError;
use crate::types::types::{NodeConfig, Result};

pub fn get_nodes_dir(app_handle: &AppHandle) -> PathBuf {
    app_handle
        .path_resolver()
        .app_data_dir()
        .expect("Failed to get app data dir")
        .join("nodes")
}

lazy_static! {
    static ref ANSI_ESCAPE_RE: Regex = Regex::new(r"\x1B\[[0-9;]*[m]").unwrap();
}

pub fn strip_ansi_escapes(s: &str) -> String {
    ANSI_ESCAPE_RE.replace_all(s, "").to_string()
}

pub fn get_binary_path(app_handle: &AppHandle) -> PathBuf {
    let binary_name = match (std::env::consts::OS, std::env::consts::ARCH) {
        ("macos", "x86_64") => "bin/macos/meroctl_intel",
        ("macos", "aarch64") => "bin/macos/meroctl_apple",
        ("linux", "x86_64") => "bin/linux/meroctl_x86_64",
        ("linux", "aarch64") => "bin/linux/meroctl_aarch64",
        ("windows", _) => "bin/windows/meroctl.exe",
        (os, arch) => panic!("Unsupported OS or architecture: {} on {}", os, arch),
    };

    if cfg!(debug_assertions) {
        // Development (Debug mode)
        env::current_dir()
            .expect("Failed to get current directory")
            .join(binary_name)
    } else {
        // Production (Release mode)
        app_handle
            .path_resolver()
            .resolve_resource(binary_name)
            .expect("Failed to resolve binary resource")
    }
}

pub fn is_node_process_running(node_name: &str) -> bool {
    let output = Command::new("pgrep")
        .args(&["-f", &format!("meroctl.*--node-name {}.*run", node_name)])
        .output()
        .expect("Failed to execute command");
    !output.stdout.is_empty()
}

pub fn get_node_ports(node_name: &str, app_handle: &AppHandle) -> Result<NodeConfig> {
    let config_path = get_nodes_dir(app_handle)
        .join(node_name)
        .join("config.toml");
    let config_content =
        fs::read_to_string(&config_path).map_err(|e| AppError::IoError(e.to_string()))?;

    let config: Value = toml::from_str(&config_content)
        .map_err(|e| AppError::Custom(format!("Failed to parse TOML: {}", e)))?;

    let server_port = extract_port(&config, "server")?;
    let swarm_port = extract_port(&config, "swarm")?;

    Ok(NodeConfig {
        server_port,
        swarm_port,
    })
}

fn extract_port(config: &Value, key: &str) -> Result<u32> {
    config
        .get(key)
        .and_then(|v| v.get("listen"))
        .and_then(|v| v.as_array())
        .and_then(|v| v.first())
        .and_then(|v| v.as_str())
        .and_then(|v| v.split('/').nth(4))
        .and_then(|v| v.parse().ok())
        .ok_or_else(|| AppError::Custom(format!("Failed to extract {} port", key)))
}

pub fn is_port_in_use(port: u32) -> bool {
    match format!("127.0.0.1:{}", port).parse::<SocketAddr>() {
        Ok(addr) => TcpStream::connect_timeout(&addr, Duration::from_secs(1)).is_ok(),
        Err(_) => false,
    }
}

pub fn check_ports_availability(config: &NodeConfig) -> Result<()> {
    if is_port_in_use(config.server_port) || is_port_in_use(config.swarm_port) {
        return Err(AppError::Custom(format!(
            "Port {} or {} is already in use",
            config.server_port, config.swarm_port
        )));
    }
    Ok(())
}

pub fn kill_node_process(node_name: &str) -> std::io::Result<()> {
    let output = Command::new("pkill")
        .args(&["-f", &format!("meroctl.*--node-name {}.*run", node_name)])
        .output()?;

    if !output.status.success() {
        return Err(std::io::Error::new(
            std::io::ErrorKind::Other,
            String::from_utf8_lossy(&output.stderr),
        ));
    }

    Ok(())
}
