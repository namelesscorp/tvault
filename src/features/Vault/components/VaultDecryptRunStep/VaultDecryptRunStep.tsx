import { openPath } from "@tauri-apps/plugin-opener";
import { Store } from "@tauri-apps/plugin-store";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useEffectOnce } from "react-use";
import { RouteTypes } from "interfaces";
import { devError } from "utils";
import { useAppDispatch } from "features/Store";
import { UIButton, UISectionHeading } from "features/UI";
import { icons } from "~/assets/collections/icons";
import { useDecrypt } from "../../hooks/useDecrypt";
import { vaultAddRecentWithMountPath } from "../../state/Vault.actions";
import { vaultSlice } from "../../state/Vault.reducer";
import { selectVaultOpenWizardState } from "../../state/Vault.selectors";

// guard against React StrictMode double-mount in dev
let DECRYPT_RUN_GUARD = false;

const VaultDecryptRunStep = () => {
	const wizard = useSelector(selectVaultOpenWizardState);
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const [savedMountDir, setSavedMountDir] = useState<string>("");
	const [savedContainerPath, setSavedContainerPath] = useState<string>("");

	const { progress, done, error, run } = useDecrypt();

	useEffectOnce(() => {
		if (DECRYPT_RUN_GUARD) return;
		DECRYPT_RUN_GUARD = true;

		setSavedMountDir(wizard.mountDir);
		setSavedContainerPath(wizard.containerPath);

		const isPasswordMethod =
			wizard.tokenType === "none" || wizard.tokenType === "master";
		const isShamirMethod = wizard.tokenType === "share";

		if (isPasswordMethod && !wizard.password) {
			devError("Password is required for password method");
			return;
		}

		if (wizard.integrityProvider === "hmac" && !wizard.additionalPassword) {
			devError(
				"Additional password is required for HMAC integrity provider",
			);
			return;
		}

		if (
			isShamirMethod &&
			!wizard.tokenJsonPath &&
			(!wizard.shares || wizard.shares.length === 0)
		) {
			devError("Shares or token file are required for shamir method");
			return;
		}

		if (isPasswordMethod) {
			if (wizard.tokenType === "none") {
				run({
					containerPath: wizard.containerPath,
					folderPath: wizard.mountDir,
					passphrase: wizard.password!,
					tokenReaderType: "flag",
					tokenFormat: "plaintext",
					tokenFlag: wizard.password!,
					additionalPassword:
						wizard.integrityProvider === "hmac"
							? wizard.additionalPassword
							: undefined,
				});
			} else {
				run({
					containerPath: wizard.containerPath,
					folderPath: wizard.mountDir,
					passphrase: wizard.password!,
					masterToken: wizard.masterToken,
					additionalPassword:
						wizard.integrityProvider === "hmac"
							? wizard.additionalPassword
							: undefined,
				});
			}
		} else {
			if (wizard.tokenJsonPath) {
				run({
					containerPath: wizard.containerPath,
					folderPath: wizard.mountDir,
					tokenReaderType: "file",
					tokenFormat: "json",
					tokenPath: wizard.tokenJsonPath,
					additionalPassword:
						wizard.integrityProvider === "hmac"
							? wizard.additionalPassword
							: undefined,
				});
			} else {
				const filtered =
					wizard.shares?.filter(s => s.trim().length > 0) || [];
				run({
					containerPath: wizard.containerPath,
					folderPath: wizard.mountDir,
					tokenReaderType: "flag",
					tokenFormat: "plaintext",
					tokenFlag: filtered.join("|"),
					additionalPassword:
						wizard.integrityProvider === "hmac"
							? wizard.additionalPassword
							: undefined,
				});
			}
		}

		return () => {
			DECRYPT_RUN_GUARD = false;
		};
	});

	if (done && !error) {
		DECRYPT_RUN_GUARD = false;

		dispatch(
			vaultSlice.actions.vaultAddContainer({
				containerPath: savedContainerPath,
				mountDir: savedMountDir,
			}),
		);

		(async () => {
			try {
				const store = await Store.load("recent-containers.json");
				const KEY = "recent";
				const recent =
					(await store.get<
						{
							path: string;
							lastOpenedAt: number;
							lastMountPath?: string;
						}[]
					>(KEY)) ?? [];
				console.log("Saving mount path:", {
					path: savedContainerPath,
					mountPath: savedMountDir,
				});
				const filtered = recent.filter(
					(r: { path: string }) => r.path !== savedContainerPath,
				);
				filtered.unshift({
					path: savedContainerPath,
					lastOpenedAt: Date.now(),
					lastMountPath: savedMountDir,
				});
				const capped = filtered.slice(0, 100);
				await store.set(KEY, capped);
				await store.save();
				console.log("Saved recent containers:", capped);
				dispatch(
					vaultAddRecentWithMountPath({
						path: savedContainerPath,
						mountPath: savedMountDir,
					}),
				);
			} catch (e) {
				devError(e);
			}
		})();

		(async () => {
			if (savedMountDir) {
				try {
					await openPath(savedMountDir);
				} catch (e) {
					devError(e);
				}
			}
		})();

		try {
			dispatch(vaultSlice.actions.vaultResetOpenWizardState());
		} catch {}
	}

	const openMountFolder = async () => {
		if (!savedMountDir) return;
		try {
			await openPath(savedMountDir);
		} catch (e) {
			devError(e);
			toast.error("Failed to open folder");
		}
	};

	if (error) {
		return (
			<div>
				<UISectionHeading icon={icons.unlock} text={"Open"} />
				<p className="text-[20px] text-medium text-white text-center mt-[10px]">
					Opening container
				</p>
				<div className="mt-[16px] grid grid-cols-[auto_1fr] gap-x-[30px] gap-y-[12px] p-[15px] bg-white/5 rounded-[10px] text-[15px] text-white">
					<p className="opacity-50">Error:</p>
					<p>{String((error as Error)?.message ?? error)}</p>
				</div>
				<div className="flex items-center gap-[10px] mt-[20px]">
					<UIButton
						icon={icons.back}
						text="Back"
						onClick={() => navigate(-1)}
						style={{ width: "fit-content" }}
					/>
					<UIButton
						icon={icons.close}
						text="Close"
						onClick={() => navigate(RouteTypes.Dashboard)}
						style={{ width: "fit-content" }}
					/>
				</div>
			</div>
		);
	}

	if (!done) {
		return (
			<div>
				<UISectionHeading icon={icons.unlock} text={"Open"} />
				<p className="text-[20px] text-medium text-white text-center mt-[10px]">
					Opening container
				</p>
				<div className="flex flex-col items-center gap-[20px] mt-[20px]">
					<div className="w-[320px]">
						<div className="h-[10px] bg-white/10 rounded-[10px]">
							<div
								className="h-[10px] bg-[#3361D8] rounded-[10px] transition-all duration-300 ease"
								style={{
									width: `${progress}%`,
								}}></div>
						</div>
					</div>
					<p className="text-[16px] text-white/50 text-medium">
						Progress: {progress}%
					</p>
				</div>
			</div>
		);
	}

	return (
		<div>
			<UISectionHeading icon={icons.unlock} text={"Open"} />
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				Decrypted folder
			</p>
			<div className="flex flex-col gap-[20px]">
				<div className="grid grid-cols-[1fr_1fr] gap-[20px] mt-[20px]">
					<div className="flex items-center p-[15px] gap-[10px] bg-white/5 rounded-[10px] text-white min-w-0">
						<p className="opacity-50 whitespace-nowrap">
							Folder path:
						</p>
						<p
							className="text-[16px] text-medium text-white overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0"
							title={savedMountDir}>
							{savedMountDir}
						</p>
					</div>
					<div className="flex items-center gap-[10px]">
						<UIButton
							icon={icons.folder}
							text="Open folder"
							onClick={openMountFolder}
							style={{ width: "fit-content" }}
						/>
						<UIButton
							icon={icons.check}
							text="Done"
							onClick={() => navigate(RouteTypes.Dashboard)}
							style={{ width: "fit-content" }}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export { VaultDecryptRunStep };
