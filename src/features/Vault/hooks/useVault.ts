import { invoke } from "@tauri-apps/api/core";
import { tempDir } from "@tauri-apps/api/path";
import { BaseDirectory, remove } from "@tauri-apps/plugin-fs";
import { useCallback, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { devError, devLog, openPathUniversal } from "utils";
import { keychainHas, keychainMove } from "features/Keychain";
import { ModalTypes } from "features/Modal/Modal.model";
import {
	modalSetIcon,
	modalSetOpen,
	modalSetTitle,
	modalSetType,
} from "features/Modal/state/Modal.actions";
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
import { icons } from "assets/collections/icons";
import { ResealData } from "../Vault.model";

export const useVault = (
	onContainerClose?: (containerPath: string) => void,
) => {
	const dispatch = useAppDispatch();
	const infoMap = useSelector(selectVaultContainerInfo);
	const recent = useSelector(selectVaultRecent);
	const { run: runReseal, progress: resealProgress } = useReseal();
	const { run: runContainerInfo } = useContainerInfo();
	const { formatMessage } = useIntl();

	/** Which container is being repacked right now — the card shows a spinner. */
	const [closingPath, setClosingPath] = useState<string | null>(null);

	const handleOpenFolder = useCallback(async (mountDir: string) => {
		try {
			await openPathUniversal(mountDir);
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
			setClosingPath(containerPath);
			try {
				if (resealData) {
					const containerInfo = infoMap[containerPath];
					/** An empty object would silently strip name/comment/tags on reseal. */
					const hasInfo =
						!!resealData.containerInfo &&
						Object.keys(resealData.containerInfo).length > 0;
					const completeResealData: ResealData = {
						...resealData,
						containerInfo: hasInfo
							? resealData.containerInfo
							: (containerInfo ??
								({} as ResealData["containerInfo"])),
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
							newPath:
								completeResealData.newContainerPath ||
								completeResealData.containerPath,
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

						/** Keep the Keychain secret pointing at the moved file. */
						if (
							completeResealData.newContainerPath &&
							completeResealData.newContainerPath !==
								completeResealData.containerPath
						) {
							await keychainMove(
								completeResealData.containerPath,
								completeResealData.newContainerPath,
							);
						}

						devLog("[tvault] Reseal completed successfully");
						toast.success(
							formatMessage({ id: "container.reseal.success" }),
						);

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
							formatMessage({ id: "container.reseal.error" }),
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
				toast.error(formatMessage({ id: "container.close.error" }));
			} finally {
				setClosingPath(null);
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

			/** Probe the Keychain (no biometric prompt) to offer a Touch ID unlock. */
			const keychainAvailable = await keychainHas(containerPath);

			dispatch(
				vaultSetOpenWizardState({
					containerPath: containerPath,
					mountDir: "",
					autoMountDir: !savedMountPath,
					customMountDir: savedMountPath || "",
					tokenType: info?.token_type as any,
					method: method as any,
					integrityProvider: integrity,
					keychainAvailable,
					quickOpen: true,
				} as any),
			);

			dispatch(modalSetTitle(formatMessage({ id: "modal.unlock" })));
			dispatch(modalSetIcon(icons.folder_shield));
			dispatch(modalSetType(ModalTypes.OPEN));
			dispatch(modalSetOpen(true));
		},
		[dispatch, infoMap, recent, formatMessage],
	);

	return {
		handleOpenFolder,
		handleCloseContainer,
		handleOpenClosedContainer,
		closingPath,
		closingProgress: resealProgress,
	};
};
