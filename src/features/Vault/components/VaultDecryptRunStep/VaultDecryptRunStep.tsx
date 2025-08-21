import { openPath } from "@tauri-apps/plugin-opener";
import { Store } from "@tauri-apps/plugin-store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RouteTypes } from "interfaces";
import { createAsyncOnceGuard, devError, devLog, useRequestGuard } from "utils";
import { useAppDispatch } from "features/Store";
import { UIButton, UISectionHeading } from "features/UI";
import { icons } from "~/assets/collections/icons";
import { ResealData } from "../../Vault.model";
import { useDecrypt } from "../../hooks/useDecrypt";
import {
	vaultAddRecentWithMountPath,
	vaultAddResealData,
} from "../../state/Vault.actions";
import { vaultSlice } from "../../state/Vault.reducer";
import { selectVaultOpenWizardState } from "../../state/Vault.selectors";

const saveRecentData = createAsyncOnceGuard(
	async (containerPath: string, mountDir: string, dispatch: any) => {
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
				path: containerPath,
				mountPath: mountDir,
			});
			const filtered = recent.filter(
				(r: { path: string }) => r.path !== containerPath,
			);
			filtered.unshift({
				path: containerPath,
				lastOpenedAt: Date.now(),
				lastMountPath: mountDir,
			});
			const capped = filtered.slice(0, 100);
			await store.set(KEY, capped);
			await store.save();
			console.log("Saved recent containers:", capped);
			dispatch(
				vaultAddRecentWithMountPath({
					path: containerPath,
					mountPath: mountDir,
				}),
			);
		} catch (e) {
			devError(e);
		}
	},
);

const VaultDecryptRunStep = () => {
	const wizard = useSelector(selectVaultOpenWizardState);
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const [savedMountDir, setSavedMountDir] = useState<string>("");
	const [savedContainerPath, setSavedContainerPath] = useState<string>("");
	const [resealDataSaved, setResealDataSaved] = useState(false);
	const containerInfo = useSelector(
		(state: any) => state.vault.containerInfo[savedContainerPath],
	);

	const { progress, done, error, run } = useDecrypt();

	const { fn: guardedRun, reset: resetDecrypt } = useRequestGuard(run);

	useEffect(() => {
		if (!savedMountDir && !savedContainerPath) {
			setSavedMountDir(wizard.mountDir);
			setSavedContainerPath(wizard.containerPath);
		}
	}, [
		wizard.mountDir,
		wizard.containerPath,
		savedMountDir,
		savedContainerPath,
	]);

	useEffect(() => {
		if (savedMountDir && savedContainerPath && !done && !error) {
			const isPasswordMethod = wizard.tokenType === "none";
			const isMasterMethod = wizard.tokenType === "master";
			const isShamirMethod = wizard.tokenType === "share";

			if (isPasswordMethod && !wizard.password) {
				devError("Password is required for password method");
				return;
			}

			if (isMasterMethod && !wizard.masterToken) {
				devError("Master token is required for master method");
				return;
			}

			if (
				wizard.integrityProvider === "hmac" &&
				!wizard.additionalPassword
			) {
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

			if (progress > 0) {
				devLog("[tvault] decrypt already in progress, skipping");
				return;
			}

			if (isPasswordMethod) {
				guardedRun({
					containerPath: savedContainerPath,
					folderPath: savedMountDir,
					passphrase: wizard.password!,
					tokenReaderType: "flag",
					tokenFormat: "plaintext",
					tokenFlag: wizard.password!,
					additionalPassword:
						wizard.integrityProvider === "hmac"
							? wizard.additionalPassword
							: undefined,
				});
			} else if (isMasterMethod) {
				guardedRun({
					containerPath: savedContainerPath,
					folderPath: savedMountDir,
					tokenReaderType: "flag",
					tokenFormat: "plaintext",
					tokenFlag: wizard.masterToken!,
					additionalPassword:
						wizard.integrityProvider === "hmac"
							? wizard.additionalPassword
							: undefined,
				});
			} else {
				if (wizard.tokenJsonPath) {
					guardedRun({
						containerPath: savedContainerPath,
						folderPath: savedMountDir,
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
					guardedRun({
						containerPath: savedContainerPath,
						folderPath: savedMountDir,
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
		}
	}, [
		savedMountDir,
		savedContainerPath,
		wizard,
		done,
		error,
		guardedRun,
		progress,
	]);

	useEffect(() => {
		if (done && !error && !resealDataSaved) {
			setResealDataSaved(true);

			const resealData: ResealData = {
				containerPath: savedContainerPath,
				mountDir: savedMountDir,
				containerInfo: containerInfo || {},
				passphrase: wizard.password,
				masterToken: wizard.masterToken,
				shares: wizard.shares,
				tokenJsonPath: wizard.tokenJsonPath,
				additionalPassword: wizard.additionalPassword,
				originalAdditionalPassword: wizard.additionalPassword,
				method: wizard.method,
				tokenType: wizard.tokenType,
				integrityProvider: wizard.integrityProvider,
			};

			if (!wizard.password && wizard.tokenType === "none") {
				devError("No password found for passphrase-only container!");
			}
			if (
				!wizard.password &&
				wizard.tokenType === "master" &&
				!wizard.masterToken
			) {
				devError(
					"No password or master token found for master token container!",
				);
			}
			if (
				wizard.tokenType === "share" &&
				(!wizard.shares || wizard.shares.length === 0)
			) {
				devError("No shares found for shamir container!");
			}

			dispatch(vaultAddResealData(resealData));
			devLog("Adding reseal data:", resealData);
			devLog("Container info from state:", containerInfo);
			devLog("Wizard data:", {
				password: wizard.password ? "***" : "undefined",
				masterToken: wizard.masterToken ? "***" : "undefined",
				shares: wizard.shares?.length || 0,
				additionalPassword: wizard.additionalPassword
					? "***"
					: "undefined",
				tokenType: wizard.tokenType,
				integrityProvider: wizard.integrityProvider,
			});
			devLog("Wizard password length:", wizard.password?.length || 0);
			devLog("Wizard password exists:", !!wizard.password);

			dispatch(
				vaultSlice.actions.vaultAddContainer({
					containerPath: savedContainerPath,
					mountDir: savedMountDir,
				}),
			);

			(async () => {
				await saveRecentData(
					savedContainerPath,
					savedMountDir,
					dispatch,
				);
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
	}, [
		done,
		error,
		resealDataSaved,
		savedContainerPath,
		savedMountDir,
		containerInfo,
		wizard,
		dispatch,
	]);

	if (error) {
		resetDecrypt();
		setResealDataSaved(false);

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

	const openMountFolder = async () => {
		if (!savedMountDir) return;
		try {
			await openPath(savedMountDir);
		} catch (e) {
			devError(e);
			toast.error("Failed to open folder");
		}
	};

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
