use std::env;
use std::env::consts::{ARCH, OS};

pub fn determine_bin_data() -> (String, String, String) {
    if let Ok(target) = env::var("TARGET") {
        let parts: Vec<&str> = target.split('-').collect();
        let os = parts[2];
        let arch = parts[0];
        let binary_name = format!("merod_{}", target);
        (os.to_string(), arch.to_string(), binary_name)
    } else {
        let os = match OS {
            "macos" => "darwin",
            other => other,
        };
        let arch = ARCH;
        let binary_name = map_os_arch_to_binary_name(os, arch);
        (os.to_string(), arch.to_string(), binary_name)
    }
}

pub fn map_os_arch_to_binary_name(os: &str, arch: &str) -> String {
    match (os, arch) {
        ("windows", "x86_64") => "merod-x86_64-pc-windows-msvc",
        ("darwin", "x86_64") => "merod_x86_64-apple-darwin",
        ("darwin", "aarch64") => "merod_aarch64-apple-darwin",
        ("linux", "x86_64") => "merod_x86_64-unknown-linux-gnu",
        // Add more combinations as needed
        _ => panic!("Unsupported OS/architecture combination: {}/{}", os, arch),
    }
    .to_string()
}
