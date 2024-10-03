use eyre::{eyre, Result};
use lazy_static::lazy_static;
use multiaddr::{Multiaddr, Protocol};
use serde_json::Value;
use std::path::PathBuf;
use sysinfo::{ProcessRefreshKind, RefreshKind, System};
use tauri::regex::Regex;

use std::{env, fs};
use tauri::AppHandle;

use crate::types::types::NodeConfig;

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

pub fn get_binary_path(app_handle: &AppHandle) -> Result<PathBuf> {
    let binary_name = "meroctl"; // The binary name is now consistent across all platforms

    let bin_dir = format!("bin/{}/{}", std::env::consts::OS, std::env::consts::ARCH);
    let binary_path = format!("{}/{}", bin_dir, binary_name);

    if cfg!(debug_assertions) {
        // Development (Debug mode)
        Ok(env::current_dir()
            .map_err(|e| eyre!("Failed to get current directory: {}", e))?
            .join(binary_path))
    } else {
        // Production (Release mode)
        app_handle
            .path_resolver()
            .resolve_resource(&binary_path)
            .ok_or_else(|| eyre!("Failed to resolve binary resource"))
    }
}

pub fn is_node_process_running(node_name: &str) -> Result<bool> {
    let system = System::new_with_specifics(
        RefreshKind::new().with_processes(ProcessRefreshKind::everything()),
    );

    let pattern = format!(r"meroctl.*--node-name\s+{}.*run", regex_escape(node_name));
    let re = Regex::new(&pattern).map_err(|e| eyre!("Failed to create regex: {}", e))?;

    Ok(system.processes().values().any(|process| {
        let cmd = process
            .cmd()
            .iter()
            .filter_map(|arg| arg.to_str())
            .collect::<Vec<&str>>()
            .join(" ");

        re.is_match(&cmd)
    }))
}

pub fn get_node_ports(node_name: &str, app_handle: &AppHandle) -> Result<NodeConfig> {
    let config_path = get_nodes_dir(app_handle)
        .join(node_name)
        .join("config.toml");
    let config_content =
        fs::read_to_string(&config_path).map_err(|e| eyre!("Failed to read config file: {}", e))?;

    let config: Value =
        toml::from_str(&config_content).map_err(|e| eyre!("Failed to parse TOML: {}", e))?;

    let server_port = extract_port(&config, "server")?;
    let swarm_port = extract_port(&config, "swarm")?;

    Ok(NodeConfig {
        server_port,
        swarm_port,
    })
}

fn extract_port(config: &Value, key: &str) -> Result<u16> {
    let listen_addr = config
        .get(key)
        .and_then(|v| v.get("listen"))
        .and_then(|v| v.as_array())
        .and_then(|v| v.first())
        .and_then(|v| v.as_str())
        .ok_or_else(|| eyre!("Failed to extract {} listen address", key))?;

    let multiaddr: Multiaddr = listen_addr
        .parse()
        .map_err(|e| eyre!("Failed to parse multiaddr: {}", e))?;

    for protocol in multiaddr.iter() {
        if let Protocol::Tcp(port) = protocol {
            return Ok(port);
        }
    }

    Err(eyre!("Failed to extract {} port", key))
}

// Helper function to escape special regex characters
fn regex_escape(s: &str) -> String {
    let mut result = String::with_capacity(s.len() * 2);
    for c in s.chars() {
        match c {
            '.' | '+' | '*' | '?' | '^' | '$' | '(' | ')' | '[' | ']' | '{' | '}' | '|' | '\\' => {
                result.push('\\');
                result.push(c);
            }
            _ => result.push(c),
        }
    }
    result
}
