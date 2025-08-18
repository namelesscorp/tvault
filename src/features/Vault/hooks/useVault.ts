import { invoke } from "@tauri-apps/api/core";
import { tempDir } from "@tauri-apps/api/path";
import { BaseDirectory, remove } from "@tauri-apps/plugin-fs";
import { openPath } from "@tauri-apps/plugin-opener";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RouteTypes } from "interfaces";
import { devError } from "utils";
import { useAppDispatch } from "features/Store";
import { vaultSetOpenWizardState } from "features/Vault/state/Vault.actions";
import { vaultSlice } from "features/Vault/state/Vault.reducer";
import {
	selectVaultContainerInfo,
	selectVaultRecent,
} from "features/Vault/state/Vault.selectors";

export const useVault = (
	onContainerClose?: (containerPath: string) => void,
) => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const infoMap = useSelector(selectVaultContainerInfo);
	const recent = useSelector(selectVaultRecent);

	const handleOpenFolder = useCallback(async (mountDir: string) => {
		try {
			await openPath(mountDir);
		} catch (e) {
			devError(e);
		}
	}, []);

	const handleCloseContainer = useCallback(
		async (containerPath: string, mountDir: string) => {
			try {
				const tmpPath = await tempDir();

				if (mountDir.startsWith(tmpPath)) {
					let relative = mountDir.slice(tmpPath.length);
					relative = relative.replace(/^\/+/, "");

					await remove(relative, {
						baseDir: BaseDirectory.Temp,
						recursive: true,
					});
				} else {
					try {
						await invoke("remove_dir", {
							path: mountDir,
							recursive: true,
						});
					} catch (removeErr) {
						devError("Failed to remove custom folder", removeErr);
					}
				}

				dispatch(
					vaultSlice.actions.vaultRemoveContainer(containerPath),
				);
				onContainerClose?.(containerPath);
			} catch (err) {
				devError("Failed to unmount", err);
			}
		},
		[dispatch, onContainerClose],
	);

	const handleOpenClosedContainer = useCallback(
		async (containerPath: string) => {
			const info = infoMap[containerPath];
			const method = info?.token_type === "share" ? "shamir" : "password";
			const integrity =
				info?.integrity_provider_type === "hmac" ? "hmac" : "none";

			const recentItem = recent.find(r => r.path === containerPath);
			const savedMountPath = recentItem?.lastMountPath;

			dispatch(
				vaultSetOpenWizardState({
					containerPath: containerPath,
					mountDir: "",
					autoMountDir: !savedMountPath,
					customMountDir: savedMountPath || "",
					tokenType: info?.token_type as any,
					method: method as any,
					integrityProvider: integrity,
					quickOpen: true,
				} as any),
			);

			navigate(RouteTypes.VaultOpenContainer);
		},
		[dispatch, navigate, infoMap, recent],
	);

	const handleEditContainer = useCallback(() => {
		// TODO: edit container
		toast.warn("Not implemented yet");
	}, []);

	return {
		handleOpenFolder,
		handleCloseContainer,
		handleOpenClosedContainer,
		handleEditContainer,
	};
};
