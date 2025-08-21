import { invoke } from "@tauri-apps/api/core";
import { tempDir } from "@tauri-apps/api/path";
import { BaseDirectory, remove } from "@tauri-apps/plugin-fs";
import { openPath } from "@tauri-apps/plugin-opener";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RouteTypes } from "interfaces";
import { devError, devLog } from "utils";
import { useAppDispatch } from "features/Store";
import { useContainerInfo, useReseal } from "features/Vault/hooks";
import {
	vaultRemoveResealData,
	vaultSetContainerInfo,
	vaultSetOpenWizardState,
} from "features/Vault/state/Vault.actions";
import { vaultSlice } from "features/Vault/state/Vault.reducer";
import {
	selectVaultContainerInfo,
	selectVaultRecent,
} from "features/Vault/state/Vault.selectors";
import { ResealData } from "../Vault.model";

export const useVault = (
	onContainerClose?: (containerPath: string) => void,
) => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const infoMap = useSelector(selectVaultContainerInfo);
	const recent = useSelector(selectVaultRecent);
	const { run: runReseal } = useReseal();
	const { run: runContainerInfo } = useContainerInfo();

	const handleOpenFolder = useCallback(async (mountDir: string) => {
		try {
			await openPath(mountDir);
		} catch (e) {
			devError(e);
		}
	}, []);

	const handleCloseContainer = useCallback(
		async (
			containerPath: string,
			mountDir: string,
			resealData?: ResealData,
		) => {
			try {
				if (resealData) {
					const containerInfo = infoMap[containerPath];
					const completeResealData: ResealData = {
						...resealData,
						containerInfo:
							resealData.containerInfo || containerInfo || {},
					};

					devLog(
						"[tvault] Starting reseal for container:",
						containerPath,
					);
					devLog("[tvault] Reseal data:", completeResealData);
					devLog(
						"[tvault] Container info:",
						completeResealData.containerInfo,
					);
					devLog(
						"[tvault] Container name:",
						completeResealData.containerInfo.name,
					);
					devLog(
						"[tvault] Container comment:",
						completeResealData.containerInfo.comment,
					);
					devLog(
						"[tvault] Container tags:",
						completeResealData.containerInfo.tags,
					);
					devLog(
						"[tvault] Token type:",
						completeResealData.tokenType,
					);
					devLog(
						"[tvault] Has passphrase:",
						!!completeResealData.passphrase,
					);
					devLog(
						"[tvault] Has master token:",
						!!completeResealData.masterToken,
					);
					devLog(
						"[tvault] Has shares:",
						!!completeResealData.shares?.length,
					);

					try {
						const resealArgs: any = {
							currentPath: completeResealData.containerPath,
							newPath: completeResealData.containerPath,
							folderPath: completeResealData.mountDir,
						};

						if (completeResealData.containerInfo.name) {
							resealArgs.name =
								completeResealData.containerInfo.name;
						}

						if (completeResealData.containerInfo.comment) {
							resealArgs.comment =
								completeResealData.containerInfo.comment;
						}
						if (completeResealData.containerInfo.tags?.length) {
							resealArgs.tags =
								completeResealData.containerInfo.tags.join(",");
						}

						if (completeResealData.tokenType) {
							resealArgs.tokenType = completeResealData.tokenType;

							if (
								completeResealData.tokenType === "master" &&
								completeResealData.masterToken
							) {
								resealArgs.masterToken =
									completeResealData.masterToken;
							} else if (
								completeResealData.tokenType === "share"
							) {
								if (completeResealData.tokenJsonPath) {
									resealArgs.tokenJsonPath =
										completeResealData.tokenJsonPath;
								} else if (completeResealData.shares?.length) {
									resealArgs.shares =
										completeResealData.shares;
								}
							} else if (
								completeResealData.tokenType === "none" &&
								completeResealData.passphrase
							) {
								resealArgs.passphrase =
									completeResealData.passphrase;
								resealArgs.masterToken =
									completeResealData.passphrase;
							}
						}

						if (
							completeResealData.integrityProvider &&
							completeResealData.integrityProvider !== "none"
						) {
							resealArgs.integrityProvider =
								completeResealData.integrityProvider;
							if (completeResealData.additionalPassword) {
								const currentPassword =
									completeResealData.originalAdditionalPassword ||
									completeResealData.additionalPassword;
								const newPassword =
									completeResealData.additionalPassword;

								resealArgs.currentIntegrityPassword =
									currentPassword;
								resealArgs.newIntegrityPassword = newPassword;

								devLog("[tvault] Integrity password change:", {
									original:
										completeResealData.originalAdditionalPassword
											? "***"
											: "undefined",
									current: currentPassword
										? "***"
										: "undefined",
									new: newPassword ? "***" : "undefined",
									changed: currentPassword !== newPassword,
								});
							}
						}

						devLog("[tvault] Final reseal args:", resealArgs);
						await runReseal(resealArgs);

						devLog("[tvault] Reseal completed successfully");
						toast.success("Контейнер успешно перепакован");

						try {
							await runContainerInfo(containerPath);

							if (resealData) {
								const updatedInfo = {
									...infoMap[containerPath],
									name: resealData.containerInfo.name,
									comment: resealData.containerInfo.comment,
									tags: resealData.containerInfo.tags,
								};
								dispatch(
									vaultSetContainerInfo({
										path: containerPath,
										info: updatedInfo,
									}),
								);
							}
						} catch (infoErr) {
							devError(
								"Failed to update container info after reseal",
								infoErr,
							);
						}

						await new Promise(resolve => setTimeout(resolve, 1000));
					} catch (resealErr) {
						devError("Failed to reseal container", resealErr);
						toast.error(
							"Ошибка при перепаковке контейнера. Контейнер остается открытым.",
						);
						return;
					}
				}

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
				if (resealData) {
					dispatch(vaultRemoveResealData(containerPath));
				}

				onContainerClose?.(containerPath);
			} catch (err) {
				devError("Failed to close container", err);
				toast.error("Ошибка при закрытии контейнера");
			}
		},
		[dispatch, onContainerClose, runReseal, infoMap],
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

	return {
		handleOpenFolder,
		handleCloseContainer,
		handleOpenClosedContainer,
	};
};
