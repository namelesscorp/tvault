import { relaunch } from "@tauri-apps/plugin-process";
import { Update, check } from "@tauri-apps/plugin-updater";
import { useCallback, useRef, useState } from "react";

export interface UpdateInfo {
	version: string;
	date?: string;
	body?: string;
}

export interface UpdateState {
	isChecking: boolean;
	isDownloading: boolean;
	isInstalling: boolean;
	currentVersion: string;
	latestVersion?: string;
	updateAvailable: boolean;
	updateDownloaded: boolean;
	error?: string;
}

export const useUpdater = () => {
	const updateRef = useRef<Update | null>(null);

	const [state, setState] = useState<UpdateState>({
		isChecking: false,
		isDownloading: false,
		isInstalling: false,
		currentVersion: APP_VERSION || "0.1.0-beta",
		updateAvailable: false,
		updateDownloaded: false,
	});

	const initializeVersion = useCallback(async () => {
		try {
			setState(prev => ({
				...prev,
				currentVersion: APP_VERSION || "0.1.0-beta",
			}));
		} catch (error) {
			console.error("Failed to get app version:", error);
		}
	}, []);

	const checkForUpdates = useCallback(async () => {
		setState(prev => ({ ...prev, isChecking: true, error: undefined }));

		try {
			const update = await check();
			updateRef.current = update;

			if (update) {
				setState(prev => ({
					...prev,
					isChecking: false,
					latestVersion: update.version,
					updateAvailable: true,
				}));
			} else {
				setState(prev => ({
					...prev,
					isChecking: false,
					updateAvailable: false,
				}));
			}
		} catch (error) {
			console.error("Failed to check for updates:", error);
			setState(prev => ({
				...prev,
				isChecking: false,
				error: error instanceof Error ? error.message : "Unknown error",
			}));
		}
	}, []);

	const downloadUpdate = useCallback(async () => {
		setState(prev => ({ ...prev, isDownloading: true, error: undefined }));

		try {
			if (!updateRef.current) {
				throw new Error("No update available");
			}

			await updateRef.current.download();

			setState(prev => ({
				...prev,
				isDownloading: false,
				updateDownloaded: true,
			}));
		} catch (error) {
			console.error("Failed to download update:", error);
			setState(prev => ({
				...prev,
				isDownloading: false,
				error:
					error instanceof Error ? error.message : "Download failed",
			}));
		}
	}, []);

	const installUpdate = useCallback(async () => {
		setState(prev => ({ ...prev, isInstalling: true, error: undefined }));

		try {
			if (!state.updateDownloaded) {
				throw new Error(
					"Update must be downloaded before installation",
				);
			}

			if (!updateRef.current) {
				throw new Error("No update available");
			}

			await updateRef.current.install();

			await relaunch();
		} catch (error) {
			console.error("Failed to install update:", error);
			setState(prev => ({
				...prev,
				isInstalling: false,
				error:
					error instanceof Error
						? error.message
						: "Installation failed",
			}));
		}
	}, [state.updateDownloaded]);

	const resetError = useCallback(() => {
		setState(prev => ({ ...prev, error: undefined }));
	}, []);

	const resetUpdateState = useCallback(() => {
		updateRef.current = null;
		setState(prev => ({
			...prev,
			updateAvailable: false,
			updateDownloaded: false,
			latestVersion: undefined,
			error: undefined,
		}));
	}, []);

	return {
		...state,
		initializeVersion,
		checkForUpdates,
		downloadUpdate,
		installUpdate,
		resetError,
		resetUpdateState,
	};
};
