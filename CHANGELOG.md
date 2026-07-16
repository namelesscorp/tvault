# Changelog

All notable changes to TVault are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] — 2026-07-17

### Fixed

- Notifications no longer flash and vanish the instant they appear when interface animations are turned off (Settings › Interface). A toast is dismissed when its progress bar finishes animating, and "no motion" was collapsing that animation to an instant — closing every notification before it could be read. Toasts now stay for their full duration regardless of the animation setting.

## [1.0.0] — 2026-07-12

The first stable release. The interface was rebuilt around a vault dashboard, and the app now ships with tvault-core 1.1.0.

> **Container format changed.** Vaults created with the 0.1.x betas cannot be opened by 1.0.0 — the core rewrote its metadata format. Unlock your vaults with a 0.1.x build, copy the files out, and create the vaults again with 1.0.0.

### Added

- **Dashboard.** All your vaults on one screen, each as a card showing its file count, size, security score and unlock method. Locked and unlocked vaults are distinguished at a glance.
- **Statistics.** Totals across every vault: vault count, encrypted files, total size and an average security score.
- **Security score.** Reported by the core for each vault and colour-coded — red below 30%, amber up to 70%, green above.
- **Search, filters and tags.** Find a vault by name or tag, or filter the list down to locked or unlocked vaults.
- **Scanned folders.** Point the app at the folders where you keep containers (Settings › General) and your vaults are found automatically on startup.
- **Progress reporting.** Creating, unlocking and locking a vault report real progress from the core instead of an indeterminate spinner.
- **Compressed vs. original size.** Hover the size on a card, or the total size tile, to roll the packed size over to the original one.
- **Vault information.** A per-vault panel with metadata, paths, integrity and compression settings.
- **Settings.** A dedicated window with General, Interface, Notifications, Backup and Updates sections.
- **Light and dark themes**, following the system theme by default.
- **Interface animations**, with a switch to turn all motion off (Settings › Interface).
- **Automatic updates.** Off by default. When enabled, new releases are checked for and downloaded in the background; installing is always confirmed by you and never happens while a vault is unlocked.
- **Settings import and export** to a plain JSON file. Preferences, scanned folders and the vault list — never passwords, tokens or shares.
- **English and Russian** interface languages.

### Changed

- Upgraded to **tvault-core 1.1.0**: vault metadata now carries the file count, packed and original sizes and a security score, and every long operation reports progress.
- Vault creation is a three-step flow (information → folders → security) instead of a long single form.
- Errors from the core are translated into readable messages instead of raw exit codes.
- macOS uses the native window controls and title bar.
- New application icon and logo.

### Fixed

- Unlocking a vault no longer forgets its credentials: editing an unlocked vault used to claim it was locked, and closing it could skip the reseal and lose files added to the mounted folder.
- Vaults added to the dashboard survive a restart.
- Creating a vault at a path that already holds one is refused instead of silently overwriting it.
- Disabled buttons are no longer clickable — deleting a vault required no confirmation in some states.
- Unlocking a password-protected vault works (the passphrase was not passed to the core).
- Creating a vault with a master token now shows the token.
- Modals no longer close when a click starts inside them and ends outside.
- Long names, comments and large numbers no longer overflow their cards.

## [0.1.3-beta] — 2025-09-03

### Added

- Linux build.
- Security policy and issue templates.

## [0.1.2-beta] — 2025-08-28

### Added

- In-app update installation.

### Fixed

- The core CLI no longer flashes a console window on Windows.

## [0.1.1-beta] — 2025-08-28

### Fixed

- Windows and macOS build and packaging fixes.

## [0.1.0-beta] — 2025-08-28

The first public beta.

### Added

- Create, unlock and reseal encrypted vaults.
- Password, master key and Shamir's Secret Sharing key types.
- HMAC integrity verification.
- Mouse-entropy key generation.
- Windows and macOS builds.

[1.0.1]: https://github.com/namelesscorp/tvault/releases/tag/v1.0.1
[1.0.0]: https://github.com/namelesscorp/tvault/releases/tag/v1.0.0
[0.1.3-beta]: https://github.com/namelesscorp/tvault/releases/tag/v0.1.3-beta
[0.1.2-beta]: https://github.com/namelesscorp/tvault/releases/tag/v0.1.2-beta
[0.1.1-beta]: https://github.com/namelesscorp/tvault/releases/tag/v0.1.1-beta
[0.1.0-beta]: https://github.com/namelesscorp/tvault/releases/tag/v0.1.0-beta
