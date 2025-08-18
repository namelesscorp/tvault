import { Store } from "@tauri-apps/plugin-store";
import type { ContainerInfoData } from "interfaces";
import { devError, devInfo } from "utils";
import { AppDispatch, AppGetState } from "features/Store";
import {
	vaultRemoveRecent,
	vaultSetContainerInfoMap,
} from "features/Vault/state/Vault.actions";
import { vaultSetRecent } from "features/Vault/state/Vault.actions";
import { appSlice } from "./App.reducer";
import { selectAppInited } from "./App.selectors";

export const { appSetInited, appSetLoaded } = appSlice.actions;

export const appInit =
	() => async (dispatch: AppDispatch, getState: AppGetState) => {
		const appInited = selectAppInited(getState());
		if (appInited) {
			return;
		}

		try {
			devInfo("Loading initial data");

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
				devInfo("Loaded recent containers:", recent);
				dispatch(vaultSetRecent(recent));
				const infoMap =
					(await store.get<Record<string, ContainerInfoData>>(
						"containerInfo",
					)) ?? {};
				dispatch(vaultSetContainerInfoMap(infoMap));
			} catch (e) {
				devError("Failed to load recent containers", e);
			}

			// verify recent on startup: drop not-found
			try {
				const { invoke } = await import("@tauri-apps/api/core");
				const recentList = (getState() as any).vault.recent as {
					path: string;
				}[];
				for (const item of recentList) {
					try {
						const payload = await invoke<Record<string, unknown>>(
							"container_info_once",
							{ args: { path: item.path } },
						);
						const p = (payload as any).path as string | undefined;
						const err = (payload as any).error as any | undefined;
						if (err && p) {
							const code = Number(err.code);
							const msg = String(err.message || "");
							if (
								code === 0x0043 ||
								code === 67 ||
								code === 100 ||
								msg.includes("open container error") ||
								msg.includes("no such file or directory")
							) {
								dispatch(vaultRemoveRecent(p));
							}
						}
					} catch {}
				}
			} catch {}
			dispatch(appSetInited(true));
			devInfo("App initialized");
		} catch (e) {
			devError("App initialization error");
			devError(e);
		}
	};
