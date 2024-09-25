use serde::Serialize;
use std::fmt;

#[derive(Debug, Serialize)]
#[serde(tag = "type", content = "message")]
pub enum AppError {
    Tauri(String),
    IoError(String),
    Process(String),
    Store(String),
    InvalidInput(String),
    Custom(String),
    TomlError(String)
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::Tauri(message) => write!(f, "Tauri error: {}", message),
            AppError::IoError(message) => write!(f, "IO error: {}", message),
            AppError::Process(message) => write!(f, "Process error: {}", message),
            AppError::Store(message) => write!(f, "Store error: {}", message),
            AppError::InvalidInput(message) => write!(f, "Invalid input: {}", message),
            AppError::Custom(message) => write!(f, "Error: {}", message),
            AppError::TomlError(message) => write!(f, "Toml error: {}", message),
        }
    }
}

impl std::error::Error for AppError {}

impl From<tauri::Error> for AppError {
    fn from(err: tauri::Error) -> Self {
        AppError::Tauri(err.to_string())
    }
}

impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        AppError::IoError(err.to_string())
    }
}

impl From<String> for AppError {
    fn from(err: String) -> Self {
        AppError::Custom(err)
    }
}

impl From<&str> for AppError {
    fn from(err: &str) -> Self {
        AppError::Custom(err.to_string())
    }
}

impl From<toml::ser::Error> for AppError {
    fn from(err: toml::ser::Error) -> Self {
        AppError::TomlError(err.to_string())
    }
}

impl From<toml::de::Error> for AppError {
    fn from(err: toml::de::Error) -> Self {
        AppError::TomlError(err.to_string())
    }
}
