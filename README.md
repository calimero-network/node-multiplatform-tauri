# Node Multiplatform Wrapper with Tauri

This is a [Tauri](https://tauri.app/) desktop application created using Node.js and Rust. The app serves as a GUI for interacting with the Calimero node.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Rust](https://www.rust-lang.org/)
- [pnpm](https://pnpm.js.org/) (as the package manager)

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/calimero-network/node-multiplatform-tauri.git
   ```

2. Navigate to the project directory:

   ```bash
   cd node-multiplatform-tauri
   ```

3. Install the dependencies using pnpm:
   ```bash
   pnpm install
   ```

4. Run the development environment:
   ```bash
   pnpm run tauri dev
   ```

   - In development mode, the Calimero node binary is stored in the `src-tauri/bin` folder.
   - Depending on the `--target` flag during the build or the user's operating system, the app automatically downloads the Calimero node binary directly from the github release page.

## Build

To create a production build of the application, run:

```bash
pnpm run tauri build
```

- In production mode, the Calimero node binary is stored in the `resources` folder.

## Features

- The application has commands defined in `src-tauri/src/commands/mod.rs` for interacting with the Calimero node:
  - **Initialize Node**: Create and initialize a new node with specified parameters.
  - **Update Node**: Modify the configuration of an existing node.
  - **Start Node**: Start a specified node.
  - **Stop Node**: Stop a running node.
  - **Get Node Log**: Retrieve the log file for a specified node.
  - **Delete Node**: Remove a specified node from the application.
  - **Open Dashboard**: Open the admin dashboard for a specified node.

- The frontend of the application is built using **TypeScript** and **React**, providing a modern and responsive user interface.
- It includes options to run nodes on application startup and to run the application on OS startup.
- The application features an interactive CLI to interact with started nodes.
- There are checks in place to ensure that ports are not already in use and to prevent starting a node with the same name as an already running instance outside of the application.

## CI/CD

The project includes a GitHub workflow file that automates the build process for the application on multiple platforms. It builds the application for:

- **macOS** (both aarch64 and x86 architectures)
- **Linux** (both aarch64 and x86 architectures)
