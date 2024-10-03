use dotenv::dotenv;
use eyre::{eyre, Result};
use flate2::read::GzDecoder;
use reqwest::get;
use std::env;
use std::env::consts::{ARCH, OS};
use std::fs;
use std::fs::File;
use std::io::copy;
use std::io::BufReader;
use std::io::Read;
use tar::Archive;

fn main() {
    tauri::async_runtime::block_on(setup_binary()).unwrap();
    tauri_build::build()
}

pub async fn setup_binary() -> Result<()> {
    dotenv().expect("Failed to load .env file");

    let target =
        std::env::var("BINARY_TARGET").expect("BINARY_TARGET environment variable not set");
    let binary_name = "meroctl";
    let cache_dir = std::env::temp_dir().join("meroctl");
    std::fs::create_dir_all(&cache_dir).expect("Failed to create cache directory");

    let url = format!(
        "https://github.com/calimero-network/core/releases/latest/download/{}.tar.gz",
        target
    );
    let binary_path = cache_dir.join(format!("{}.tar.gz", binary_name));

    let current_dir = env::current_dir().expect("Failed to get current directory");
    let bin_dir = current_dir.join("bin").join(OS).join(ARCH);
    let resource_path = bin_dir.join(binary_name);

    if resource_path.exists() {
        return Ok(());
    }

    let response = get(&url).await.expect("Failed to download binary");
    let mut out = File::create(&binary_path).expect("Failed to create file");
    copy(&mut response.bytes().await.unwrap().as_ref(), &mut out).expect("Failed to copy content");

    let tar_gz = File::open(&binary_path).expect("Failed to open downloaded file");
    let mut buf_reader = BufReader::new(tar_gz);
    let mut header = [0; 2];
    buf_reader
        .read_exact(&mut header)
        .expect("Failed to read file header");

    if &header != b"\x1f\x8b" {
        return Err(eyre!(
            "Invalid gzip header for file: {}",
            binary_path.display()
        ));
    }

    let tar_gz = File::open(&binary_path).expect("Failed to open .gz file");
    let tar = GzDecoder::new(tar_gz);
    let mut archive = Archive::new(tar);

    fs::create_dir_all(&bin_dir).expect("Failed to create directories");
    archive.unpack(&bin_dir).expect("Failed to unpack archive");

    Ok(())
}
