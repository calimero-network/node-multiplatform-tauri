use crate::error::errors::AppError;
use crate::types::types::{AppState, Result};
use crate::utils::utils::get_nodes_dir;
use std::fs::{self, File, OpenOptions};
use std::io::{self, BufRead, BufReader, Seek, SeekFrom, Write};
use std::path::{Path, PathBuf};

use tauri::{AppHandle, State};

const MAX_LOG_SIZE: usize = 5 * 1024 * 1024; // 5MB

pub fn create_log_file(app_handle: &AppHandle, node_name: &str) -> Result<()> {
    let log_path = get_log_file_path(app_handle, node_name);
    // Ensure the directory exists
    if let Some(parent) = log_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| AppError::IoError(format!("Failed to create log directory: {}", e)))?;
    }

    // Check if the file exists, create it if it doesn't
    if !Path::new(&log_path).exists() {
        File::create(&log_path)
            .map_err(|e| AppError::IoError(format!("Failed to create log file: {}", e)))?;
    }

    Ok(())
}

pub fn write_to_log(app_handle: &AppHandle, node_name: &str, line: &str) -> Result<()> {
    let log_path = get_log_file_path(app_handle, node_name);
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_path)
        .map_err(|e| AppError::IoError(e.to_string()))?;

    writeln!(file, "{}", line).map_err(|e| AppError::IoError(e.to_string()))?;

    let log_path_str = log_path
        .to_str()
        .ok_or("Failed to convert log path to string")?;
    check_log_size_and_trim(log_path_str)?;

    Ok(())
}

fn check_log_size_and_trim(log_path: &str) -> io::Result<()> {
    let file = OpenOptions::new().read(true).write(true).open(log_path)?;
    let metadata = file.metadata()?;

    if metadata.len() > MAX_LOG_SIZE as u64 {
        let mut reader = BufReader::new(&file);
        let mut writer = &file;
        // Skip lines until we're within the size limit
        let mut current_pos = 0;
        let mut line = String::new();
        while current_pos < metadata.len() - MAX_LOG_SIZE as u64 {
            let bytes_read = reader.read_line(&mut line)?;
            current_pos += bytes_read as u64;
            line.clear();
        }

        // Truncate the file and write the remaining content
        writer.set_len(0)?;
        writer.seek(SeekFrom::Start(0))?;
        io::copy(&mut reader, &mut writer)?;
    }

    Ok(())
}

pub fn get_log_file_path(app_handle: &AppHandle, node_name: &str) -> PathBuf {
    get_nodes_dir(app_handle).join(node_name).join("node.log")
}

pub fn read_log_file(state: State<'_, AppState>, node_name: &str) -> Result<String> {
    let log_path = get_log_file_path(&state.app_handle, node_name);
    let file = OpenOptions::new().read(true).open(log_path)?;
    let reader = BufReader::new(file);
    let lines: Vec<String> = reader.lines().collect::<std::io::Result<_>>()?;

    Ok(lines.join("\n"))
}
