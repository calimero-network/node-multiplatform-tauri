use eyre::{bail, Result};
use flate2::read::GzDecoder;
use reqwest::get;
use shared_utils::determine_bin_data;
use std::fs;
use std::fs::File;
use std::io::copy;
use std::io::BufReader;
use std::io::Read;
use std::path::Path;
use tar::Archive;
use std::time::Duration;

fn main() {
    tauri::async_runtime::block_on(setup_binary()).unwrap();
    tauri_build::build()
}

async fn setup_binary() -> Result<()> {
    let (os, arch, target) = determine_bin_data();
    let binary_name = "merod";
    let cache_dir = std::env::temp_dir().join(binary_name);
    std::fs::create_dir_all(&cache_dir).expect("Failed to create cache directory");

    // Get the latest merod release tag
    let latest_release = get_latest_merod_release().await?;
    
    let url = format!(
        "https://github.com/calimero-network/core/releases/download/{}/{}.tar.gz",
        latest_release,
        target
    );
    println!("Downloading from URL: {}", url);

    let cache_bin_path = cache_dir.join(format!("{}.tar.gz", binary_name));
    let bin_dir = std::env::current_dir()?.join("bin").join(os).join(arch);
    let resource_path = bin_dir.join(binary_name);

    if resource_path.exists() {
        return Ok(());
    }

    download_and_extract(&url, &cache_bin_path, &bin_dir).await?;

    Ok(())
}

async fn download_and_extract(url: &str, cache_bin_path: &Path, bin_dir: &Path) -> Result<()> {
    let response = get(url).await.expect("Failed to download binary");
    let mut out = File::create(cache_bin_path).expect("Failed to create file");
    copy(&mut response.bytes().await.unwrap().as_ref(), &mut out).expect("Failed to copy content");

    let tar_gz = File::open(cache_bin_path).expect("Failed to open downloaded file");
    let mut buf_reader = BufReader::new(tar_gz);
    let mut header = [0; 2];
    buf_reader
        .read_exact(&mut header)
        .expect("Failed to read file header");

    if &header != b"\x1f\x8b" {
        bail!("Invalid gzip header for file: {}", cache_bin_path.display());
    }

    let tar_gz = File::open(cache_bin_path).expect("Failed to open .gz file");
    let tar = GzDecoder::new(tar_gz);
    let mut archive = Archive::new(tar);

    fs::create_dir_all(bin_dir).expect("Failed to create directories");
    archive.unpack(bin_dir).expect("Failed to unpack archive");

    Ok(())
}

async fn get_latest_merod_release() -> Result<String> {
    let client = reqwest::Client::new();
    let github_token = std::env::var("GITHUB_TOKEN").ok();
    
    // Maximum number of retries
    let max_retries = 3;
    let mut retry_count = 0;
    
    loop {
        let mut request = client
            .get("https://api.github.com/repos/calimero-network/core/releases")
            .header("User-Agent", "calimero-node-manager-build");
        
        if let Some(token) = &github_token {
            request = request.header("Authorization", format!("token {}", token));
        }
        
        let response = request.send().await?;
        
        match response.status() {
            status if status.is_success() => {
                let releases: Vec<serde_json::Value> = response.json().await?;
                
                if let Some(latest_merod) = releases.iter().find(|release| {
                    release["tag_name"]
                        .as_str()
                        .map_or(false, |tag| tag.starts_with("merod"))
                }) {
                    if let Some(tag_name) = latest_merod["tag_name"].as_str() {
                        return Ok(tag_name.to_string());
                    }
                }
                bail!("No merod release found in the response");
            },
            status if status.as_u16() == 403 => {
                if retry_count >= max_retries {
                    let error_text = response.text().await?;
                    bail!("GitHub API rate limit exceeded after {} retries: {}", max_retries, error_text);
                }
                
                // Exponential backoff: wait longer between each retry
                let wait_time = Duration::from_secs(2u64.pow(retry_count as u32));
                tokio::time::sleep(wait_time).await;
                retry_count += 1;
                continue;
            },
            status => {
                let error_text = response.text().await?;
                bail!("GitHub API error: {} - {}", status, error_text);
            }
        }
    }
}
