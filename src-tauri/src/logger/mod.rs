use crate::types::AppState;
use crate::utils::get_nodes_dir;
use std::fs::{self, File, OpenOptions};
use std::io::{self, BufRead, BufReader, Seek, SeekFrom, Write};
use std::path::PathBuf;

use eyre::{eyre, Error, Result};
use tauri::{AppHandle, State};

const MAX_LOG_SIZE: usize = 5 * 1024 * 1024; // 5MB

pub fn create_log_file(app_handle: &AppHandle, node_name: &str) -> Result<File, Error> {
    let log_path = get_log_file_path(app_handle, node_name);

    // Ensure the directory exists
    if let Some(parent) = log_path.parent() {
        fs::create_dir_all(parent).map_err(|e| eyre!("Failed to create log directory: {}", e))?;
    }

    // Open the file in append mode if it exists, or create it if it doesn't
    let file = OpenOptions::new()
        .read(true)
        .append(true)
        .create(true) // This ensures the file is created if it doesn't exist
        .open(&log_path)
        .map_err(|e| eyre!("Failed to open or create log file: {}", e))?;

    Ok(file)
}

pub fn write_to_log(file: &mut File, line: &str) -> Result<bool, Error> {
    writeln!(file, "{}", line).map_err(|e| eyre!("Failed to write to log file: {}", e))?;

    check_log_size_and_trim(file)?;

    Ok(true)
}

fn check_log_size_and_trim(file: &mut File) -> io::Result<()> {
    let metadata = file.metadata()?;

    if metadata.len() > MAX_LOG_SIZE as u64 {
        file.seek(SeekFrom::Start(0))?; // Reset the file cursor to the start
        let mut reader = BufReader::new(file.try_clone()?); // Clone the file for reading
        let writer = file; // Use the original file for writing
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
        io::copy(&mut reader, writer)?;
    }

    Ok(())
}
pub fn get_log_file_path(app_handle: &AppHandle, node_name: &str) -> PathBuf {
    get_nodes_dir(app_handle).join(node_name).join("node.log")
}

pub fn get_node_log_file(app_handle: &AppHandle, node_name: &str) -> Result<File, Error> {
    let log_path = get_log_file_path(app_handle, node_name);
    OpenOptions::new().read(true).append(true).open(log_path).map_err(|e| eyre!("Failed to open log file: {}", e))
}

pub fn read_log_file(state: State<'_, AppState>, node_name: &str) -> Result<String, Error> {
    let log_path = get_log_file_path(&state.app_handle, node_name);
    let file = OpenOptions::new()
        .read(true)
        .open(log_path)
        .map_err(|e| eyre!("Failed to open log file: {}", e))?;
    let reader = BufReader::new(file);
    let lines: Vec<String> = reader
        .lines()
        .collect::<io::Result<_>>()
        .map_err(|e| eyre!("Failed to read log file: {}", e))?;

    Ok(lines.join("\n"))
}
