# TVault (Trust Vault)

TVault is a cross-platform desktop application for creating secure encrypted vaults. A vault is essentially an encrypted folder (or container) that you can lock and unlock on demand to protect your sensitive files. When locked, all data inside the vault is encrypted and inaccessible. When unlocked, the vault behaves like a normal folder on your system, allowing you to add, remove, or edit files easily. TVault is designed with a focus on strong security, privacy, and ease of use on Windows and macOS.

## Build

### Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **Yarn** package manager
- **Rust** (latest stable version)
- **Tauri CLI**: `cargo install tauri-cli`

#### Installing Rust

If you don't have Rust installed, follow the official installation guide:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

#### Installing Tauri CLI

```bash
cargo install tauri-cli
```

### Getting Started

1. **Clone the repository**

    ```bash
    git clone https://github.com/namelesscorp/tvault.git
    cd tvault
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

### Available Scripts

#### Development

- `yarn dev` — Start Vite development server only
- `yarn tauri:dev` — Start Tauri development mode (recommended)
- `yarn preview` — Start Vite preview server

#### Build

- `yarn build` — Build for development
- `yarn build:dev` — Build Vite in development mode
- `yarn build:prod` — Build Vite in production mode
- `yarn tauri:build` — Build Tauri app

#### Cross-platform Build

- `yarn build:all` — Build for all platforms (macOS ARM, macOS Intel, Windows 32-bit, Windows 64-bit)
- `yarn build:mac-arm` — Build for macOS ARM (Apple Silicon)
- `yarn build:mac-intel` — Build for macOS Intel
- `yarn build:win-32` — Build for Windows 32-bit
- `yarn build:win-64` — Build for Windows 64-bit
- `yarn build:mac` — Build for both macOS architectures
- `yarn build:win` — Build for both Windows architectures

#### Code Quality

- `yarn format` — Format code with Prettier and fix ESLint errors
- `yarn lint:eslint` — Run ESLint

## Features

- **Secure Storage:** Protect your files with AES-256 encryption – a strong, industry-standard cipher. You can choose one of several methods to secure your vault’s encryption key:

    - **Password:** Use a password or passphrase you create.
    - **Master Key:** Let the app generate a random master key for you.
    - **Shamir’s Secret Sharing:** Split the vault’s master key into multiple parts using [Shamir’s Secret Sharing (SSS)](https://en.wikipedia.org/wiki/Shamir%27s_secret_sharing). This method allows you to require N out of M key “shares” to unlock the vault – adding an extra layer of security for collaborative or distributed scenarios.

    Additionally, TVault employs an HMAC-based integrity check on the vault data. This means any unauthorized modification of the encrypted vault file can be detected, ensuring that your data hasn’t been tampered with.

- **Cross-Platform Desktop App:** TVault runs natively on Windows and macOS, with a consistent user interface across both. The app is built with a lightweight stack (powered by Tauri) that integrates with your operating system’s native webview. This results in a small bundle size and minimal resource usage, while still providing a modern, responsive UI.

- **Open Source & Privacy-Focused:** The source code is available for review, and the application is local-first. All vault data is stored locally on your machine – TVault does not upload or sync your files to any cloud service. Your secrets stay with you. (See [License](https://github.com/namelesscorp/TVault/blob/master/LICENSE) for details on the source-available license.) The project welcomes community contributions and operates with transparency in mind.

## Installation

TVault is available for both Windows and macOS:

- **Windows:** Download the latest Windows installer (.exe) from our releases and run it. The installer will guide you through setup. Note: TVault for Windows requires the Microsoft Edge WebView2 runtime (used by the Tauri framework). On Windows 11 (and most up-to-date Windows 10 systems), WebView2 is already installed. If your system doesn’t have it, the TVault installer will automatically download and install WebView2 for you. No additional setup is needed — just follow the prompts.

- **macOS:** Download the latest macOS app (.dmg) from our releases. Open the downloaded file and drag TVault into your Applications folder.

## Usage

TVault follows a simple flow: **Create** → **Unlock** → **Work with files** → **Reseal/Close**. A vault is just an encrypted container that, when unlocked, is exposed as a normal folder in your system’s temporary directory. You work with your files using the OS file manager; the app itself doesn’t edit files.

![Dashboard](https://github.com/namelesscorp/tvault-landing/blob/master/public/single/1.webp?raw=true)

### Create a vault

1. **Name & location.** Pick a vault name and where to store the encrypted container file.

    ![Name and location](https://github.com/namelesscorp/tvault-landing/blob/master/public/single/2.webp?raw=true)

2. **Provide the secret (two ways):**

    - **Manual input** — you type a password or paste/import an existing key.
    - **Mouse-entropy generator** — open the entropy window and move the cursor.

    ![Key source](https://github.com/namelesscorp/tvault-landing/blob/master/public/single/3.webp?raw=true)

3. **Integrity.** HMAC integrity is enabled by default to detect tampering of the encrypted container.

    ![Integrity](https://github.com/namelesscorp/tvault-landing/blob/master/public/single/5.webp?raw=true)

4. **Choose key type.**

    - **Password** — unlock with a password.
    - **Master key** — unlock with a generated 256-bit key.
    - **Shamir’s Secret Sharing** — split a master key into M shares with an N-of-M threshold.

    ![Key type](https://github.com/namelesscorp/tvault-landing/blob/master/public/single/6.webp?raw=true)

5. **Finish.** The encrypted container file is created at the chosen location.

### Unlock a vault

- **Provide credentials** matching how the vault was created (password / master key / required Shamir shares, and HMAC password).

    ![Key source](https://github.com/namelesscorp/tvault-landing/blob/master/public/single/9.webp?raw=true)

    ![Key select](https://github.com/namelesscorp/tvault-landing/blob/master/public/single/10.webp?raw=true)

- On success, TVault decrypts the container into a temporary OS folder (inside your system’s temp directory). This is the folder you’ll work in.

### Work with files

- Treat the temporary folder like any normal directory: **add, edit, and delete** files using your usual apps and file manager.
- The app does not embed an editor; all changes happen in the unlocked folder.
- You can also edit vault metadata (name, tags, comment) from the app UI while the vault is managed by TVault.

### Reseal / Close

- When you’re done, click **Close** in the app.
- TVault encrypts all changes back into the container, updates the HMAC, and deletes the temporary folder in the OS temp directory.

### Important

- While a vault is unlocked, its contents exist in the OS temp directory — treat the session as sensitive (lock when you step away).
- No recovery: if you lose the required credentials (password, master key, or Shamir shares), the vault cannot be recovered. Back up keys/shares securely.

## Command-Line Interface (CLI)

For advanced users and automation scenarios, TVault also offers a Command-Line Interface (CLI) tool. The CLI provides the core functionality of TVault through terminal commands, which is useful for scripting and integrating into your workflow. Some capabilities of the CLI include:

- Vault Creation: You can create new vaults via CLI commands, specifying options such as vault name, location, and key type (password, master key, or Shamir shares). This is handy if you want to automate vault setup or incorporate TVault into installation scripts for new machines.

- Unlocking and Locking: The CLI lets you unlock (unseal) and lock (reseal) vaults from the command line. For example, you could write a script to automatically unlock a vault, run a backup or access a file, and then lock it again. The CLI accepts the required credentials (password, key, or shares) as arguments, so it can be used non-interactively in automation scenarios.

- Retrieving Data: While the vault is unlocked via CLI, you can interact with the vault’s files using normal shell commands. This enables scenarios like scheduled tasks that extract or update information in a vault without manual intervention.

- Backup and Scripting: You can script backups for safekeeping using the CLI. For instance, a cron job could use TVault CLI to unlock a vault, run a backup (copy the vault file to a backup location), and then lock it again. Or you might script the export of certain data. Essentially, anything you can do in the GUI can be done via the CLI, allowing integration with other tools (CI/CD pipelines, etc.) and workflows.

The CLI shares the same security model as the GUI, so all encryption/decryption is done locally and the same precautions apply. Please read the [CLI documentation](https://github.com/namelesscorp/tvault-core) for detailed command usage and examples.

## Contributing

Contributions are welcome! If you encounter any bugs or have ideas for improvements, feel free to open an issue or submit a pull request. We appreciate the community’s help in making TVault better:

- **Report Issues:** Use the GitHub Issues to report bugs or request features. Please include details and steps to reproduce for bugs.
- **Pull Requests:** If you want to contribute code or documentation, fork the repository and create a pull request. Ensure your changes build properly and discuss major changes in an issue first if possible. All contributions will be reviewed.

## License

TVault Core is proprietary software.
Use of this code is governed by the [License](https://github.com/namelesscorp/TVault/blob/master/LICENSE) agreement.

## Contact

If you have questions or issues, please create an Issue in the repository or contact the development team.

- [tvault.app](https://tvault.app)
- support@tvault.app

---

© 2025 Trust Vault. All rights reserved.
