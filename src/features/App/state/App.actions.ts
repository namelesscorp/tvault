import { Store } from "@tauri-apps/plugin-store";
import type { ContainerInfoData } from "interfaces";
import {
	createAsyncOnceGuard,
	devError,
	devInfo,
	getCachedLocale,
	setCachedLocale,
} from "utils";
import { AppDispatch, AppGetState } from "features/Store";
import { vaultSetContainerInfoMap } from "features/Vault/state/Vault.actions";
import { vaultSetRecent } from "features/Vault/state/Vault.actions";
import {
	cleanupNonExistentContainers,
	loadVaultSettingsFromCache,
	vaultScanContainersDirectory,
} from "features/Vault/state/Vault.actions";
import { appSlice } from "./App.reducer";
import { selectAppInited } from "./App.selectors";
import { AppSlice } from "./App.slice";

export const { appSetInited, appSetLoaded, appSetLocale } = appSlice.actions;

const appInitImpl = async (dispatch: AppDispatch, getState: AppGetState) => {
	const appInited = selectAppInited(getState());
	if (appInited) {
		return;
	}

	try {
		devInfo("Loading initial data");

		// load user locale from cache
		try {
			const cachedLocale = await getCachedLocale();
			dispatch(appSetLocale(cachedLocale));
			devInfo("Loaded cached locale:", cachedLocale);
		} catch (e) {
			devError("Failed to load cached locale", e);
		}

		// load vault settings from cache
		try {
			await loadVaultSettingsFromCache(dispatch);
		} catch (e) {
			devError("Failed to load vault settings from cache", e);
		}

		// load recent containers and cached info from persistent store
		try {
			const store = await Store.load("recent-containers.json");
			const recent =
				(await store.get<
					{
						path: string;
						lastOpenedAt: number;
						lastMountPath?: string;
					}[]
				>("recent")) ?? [];
			devInfo(
				"Loaded recent containers from store:",
				recent.map(r => r.path),
			);
			dispatch(vaultSetRecent(recent));
			const infoMap =
				(await store.get<Record<string, ContainerInfoData>>(
					"containerInfo",
				)) ?? {};
			devInfo("Loaded container info from store:", Object.keys(infoMap));
			dispatch(vaultSetContainerInfoMap(infoMap));
		} catch (e) {
			devError("Failed to load recent containers", e);
		}

		// scan containers directory if path is set (after loading from store)
		try {
			const state = getState() as any;
			const containersPath = state.vault?.containersPath;
			devInfo("Checking containers path for scanning:", containersPath);
			if (containersPath) {
				devInfo("Starting scan during app initialization");
				await dispatch(vaultScanContainersDirectory(containersPath));
			} else {
				devInfo("No containers path set, skipping scan");
			}
		} catch (e) {
			devError("Failed to scan containers directory", e);
		}

		// cleanup non-existent containers on startup
		try {
			await cleanupNonExistentContainers(dispatch);
		} catch (e) {
			devError("Failed to cleanup non-existent containers", e);
		}
		dispatch(appSetInited(true));
		devInfo("App initialized");
	} catch (e) {
		devError("App initialization error");
		devError(e);
	}
};

export const appInit = createAsyncOnceGuard(appInitImpl);

// Action for changing language with cache saving
export const appChangeLocale = (locale: AppSlice["locale"]) => {
	return async (dispatch: AppDispatch) => {
		dispatch(appSetLocale(locale));
		try {
			await setCachedLocale(locale);
			devInfo("Locale changed and cached:", locale);
		} catch (e) {
			devError("Failed to cache locale", e);
		}
	};
};
