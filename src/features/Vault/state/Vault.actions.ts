import { Store } from "@tauri-apps/plugin-store";
import { devError, devInfo } from "utils";
import { AppDispatch } from "features/Store";
import { vaultSlice } from "./Vault.reducer";

export const {
	vaultSetContainers,
	vaultAddContainer,
	vaultRemoveContainer,
	vaultSetRecent,
	vaultAddRecent,
	vaultAddRecentWithMountPath,
	vaultSetContainerInfo,
	vaultSetContainerInfoMap,
	vaultRemoveRecent,
	vaultSetWizardState,
	vaultResetWizardState,
	vaultSetOpenWizardState,
	vaultResetOpenWizardState,
	vaultUpdateRecentMountPath,
	vaultAddResealData,
	vaultRemoveResealData,
	vaultClearResealData,
	vaultSetContainersPath,
} = vaultSlice.actions;

const VAULT_SETTINGS_STORE_KEY = "vault-settings.json";
const CONTAINERS_PATH_CACHE_KEY = "containersPath";

export const loadVaultSettingsFromCache = async (dispatch: AppDispatch) => {
	try {
		const store = await Store.load(VAULT_SETTINGS_STORE_KEY);

		const cachedContainersPath = await store.get<string>(
			CONTAINERS_PATH_CACHE_KEY,
		);
		if (cachedContainersPath) {
			dispatch(vaultSetContainersPath(cachedContainersPath));
			devInfo("Loaded cached containers path:", cachedContainersPath);
		}
	} catch (error) {
		devError("Failed to load vault settings from cache:", error);
	}
};

export const saveContainersPathToCache = async (path: string) => {
	try {
		const store = await Store.load(VAULT_SETTINGS_STORE_KEY);
		await store.set(CONTAINERS_PATH_CACHE_KEY, path);
		await store.save();
		devInfo("Saved containers path to cache:", path);
	} catch (error) {
		devError("Failed to save containers path to cache:", error);
	}
};

export const vaultChangeContainersPath = (path: string) => {
	return async (dispatch: AppDispatch) => {
		dispatch(vaultSetContainersPath(path));
		try {
			await saveContainersPathToCache(path);
		} catch (e) {
			devError("Failed to cache containers path", e);
		}
	};
};

export const saveRecentToStore = async (recentContainers: any[]) => {
	try {
		const store = await Store.load("recent-containers.json");
		devInfo(
			"Saving recent containers to store:",
			recentContainers.map((r: any) => r.path),
		);
		await store.set("recent", recentContainers);
		await store.save();
		devInfo("Successfully saved recent containers to store");
	} catch (e) {
		devError("Failed to save recent containers to store", e);
	}
};

export const isContainerAccessible = async (path: string): Promise<boolean> => {
	try {
		const { invoke } = await import("@tauri-apps/api/core");
		const exists = await invoke<boolean>("check_file_exists", { path });
		return exists;
	} catch (error) {
		devError("Error checking container accessibility:", path, error);
		return false;
	}
};

export const cleanupNonExistentContainers = async (dispatch: AppDispatch) => {
	try {
		devInfo("Starting cleanup of non-existent containers");

		const store = await Store.load("recent-containers.json");
		const recent = (await store.get<any[]>("recent")) || [];

		if (recent.length === 0) {
			devInfo("No containers to check");
			return;
		}

		devInfo(
			"Checking existence of containers:",
			recent.map(r => r.path),
		);

		const containersToRemove: string[] = [];

		for (const container of recent) {
			const exists = await isContainerAccessible(container.path);
			if (!exists) {
				containersToRemove.push(container.path);
				devInfo("Container not found, will remove:", container.path);
			}
		}

		if (containersToRemove.length > 0) {
			devInfo("Removing non-existent containers:", containersToRemove);

			for (const path of containersToRemove) {
				dispatch(vaultRemoveRecent(path));
			}

			const updatedRecent = recent.filter(
				r => !containersToRemove.includes(r.path),
			);
			await saveRecentToStore(updatedRecent);

			devInfo(
				"Cleanup completed, removed containers:",
				containersToRemove,
			);
		} else {
			devInfo("All containers exist, no cleanup needed");
		}
	} catch (e) {
		devError("Failed to cleanup non-existent containers", e);
	}
};

export const vaultScanContainersDirectory = (path: string) => {
	return async (dispatch: AppDispatch) => {
		try {
			devInfo("Starting scan of containers directory:", path);

			await cleanupNonExistentContainers(dispatch);

			const { invoke } = await import("@tauri-apps/api/core");
			const containers = await invoke<string[]>(
				"scan_containers_directory",
				{ path },
			);
			devInfo("Found containers in directory:", containers);

			const store = await Store.load("recent-containers.json");
			let existingRecent = (await store.get<any[]>("recent")) || [];
			devInfo("Loaded existing recent from store:", existingRecent);

			if (!Array.isArray(existingRecent)) {
				devError(
					"Invalid recent data in store, resetting to empty array",
				);
				existingRecent = [];
			}

			const existingPaths = new Set(
				existingRecent.map((r: any) => r.path),
			);
			devInfo(
				"Existing recent containers:",
				existingRecent.map((r: any) => r.path),
			);

			const newContainers = containers.filter(
				containerPath => !existingPaths.has(containerPath),
			);
			devInfo("New containers to add:", newContainers);

			if (newContainers.length > 0) {
				const updatedRecent = [...existingRecent];
				for (const containerPath of newContainers) {
					const filtered = updatedRecent.filter(
						r => r.path !== containerPath,
					);
					filtered.unshift({
						path: containerPath,
						lastOpenedAt: Date.now(),
					});
					updatedRecent.length = 0;
					updatedRecent.push(...filtered.slice(0, 100));
				}

				dispatch(vaultSetRecent(updatedRecent));
				devInfo("Scanned and added containers:", newContainers);

				await saveRecentToStore(updatedRecent);
			} else {
				devInfo("No new containers found to add");
			}
		} catch (e) {
			devError("Failed to scan containers directory", e);
		}
	};
};
