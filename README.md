# TVault Client

A secure desktop application for vault management built with Tauri, React, and TypeScript.

## Features

- Secure vault encryption and decryption
- Container management with integrity verification
- Shamir's Secret Sharing support
- Multi-language support (English/Russian)
- Modern UI
- Cross-platform desktop application

## Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **Yarn** package manager
- **Rust** (latest stable version)
- **Tauri CLI**: `cargo install tauri-cli`

### Installing Rust

If you don't have Rust installed, follow the official installation guide:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Installing Tauri CLI

```bash
cargo install tauri-cli
```

## Getting Started

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd tvault-client
    ```

2. **Install dependencies**

    ```bash
    yarn install
    ```

3. **Run the development server**
    ```bash
    yarn tauri:dev
    ```

This will start both the frontend development server and the Tauri application.

## Available Scripts

- `yarn dev` - Start Vite development server only
- `yarn tauri:dev` - Start Tauri development mode (recommended)
- `yarn build` - Build for development
- `yarn build:prod` - Build for production
- `yarn tauri:build` - Build Tauri app
- `yarn format` - Format code with Prettier
- `yarn lint:eslint` - Run ESLint
