import { open } from "@tauri-apps/plugin-dialog";
import { Store } from "@tauri-apps/plugin-store";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RouteTypes } from "interfaces";
import {
	createAsyncOnceGuard,
	devError,
	getMountPathWithFallback,
	useRequestGuard,
} from "utils";
import { useAppDispatch } from "features/Store";
import { UIButton, UICheckbox, UIInput, UISectionHeading } from "features/UI";
import { icons } from "~/assets/collections/icons";
import { useContainerInfo } from "../../hooks/useContainerInfo";
import {
	vaultAddRecentWithMountPath,
	vaultSetOpenWizardState,
} from "../../state/Vault.actions";
import {
	selectVaultOpenWizardState,
	selectVaultRecent,
} from "../../state/Vault.selectors";

const saveRecentData = createAsyncOnceGuard(
	async (path: string, dispatch: any) => {
		try {
			const store = await Store.load("recent-containers.json");
			const KEY = "recent";
			const recentData =
				(await store.get<
					{
						path: string;
						lastOpenedAt: number;
						lastMountPath?: string;
					}[]
				>(KEY)) ?? [];
			const filtered = recentData.filter(
				(r: { path: string }) => r.path !== path,
			);
			filtered.unshift({
				path,
				lastOpenedAt: Date.now(),
			});
			const capped = filtered.slice(0, 100);
			await store.set(KEY, capped);
			await store.save();

			dispatch(vaultAddRecentWithMountPath({ path }));
		} catch (e) {
			devError("Failed to save recent container", e);
		}
	},
);

const VaultContainerStep = () => {
	const wizard = useSelector(selectVaultOpenWizardState);
	const recent = useSelector(selectVaultRecent);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { run: runContainerInfo, done, result, error } = useContainerInfo();

	const [path, setPath] = useState(wizard.containerPath);
	const [autoMountDir, setAutoMountDir] = useState(wizard.autoMountDir);
	const [customMountDir, setCustomMountDir] = useState(
		wizard.customMountDir ?? "",
	);
	const [busy, setBusy] = useState(false);
	const [containerInfo, setContainerInfo] = useState<any>(null);

	const { fn: guardedRunContainerInfo, reset: resetContainerInfo } =
		useRequestGuard(runContainerInfo);

	useEffect(() => {
		if (path) {
			const recentItem = recent.find(r => r.path === path);
			const savedMountPath = recentItem?.lastMountPath;

			console.log("Initializing mount path:", {
				path,
				savedMountPath,
				wizardCustomMountDir: wizard.customMountDir,
				autoMountDir: wizard.autoMountDir,
			});

			if (!autoMountDir && !customMountDir) {
				if (wizard.customMountDir) {
					setCustomMountDir(wizard.customMountDir);
					setAutoMountDir(false);
				} else if (savedMountPath) {
					setCustomMountDir(savedMountPath);
					setAutoMountDir(false);
				} else {
					setAutoMountDir(true);
					setCustomMountDir("");
				}
			}
		}
	}, [path, recent, wizard.customMountDir, autoMountDir, customMountDir]);

	useEffect(() => {
		if (path && !containerInfo) {
			guardedRunContainerInfo(path).catch(() => {});
		}
	}, [path, containerInfo, guardedRunContainerInfo]);

	useEffect(() => {
		if (done && result && !error) {
			const containerData = result.data;
			if (!containerData) {
				toast.error("Failed to get container information");
				return;
			}
			setContainerInfo(containerData);
		} else if (error) {
			toast.error(
				`Error getting container information: ${JSON.stringify(error)}`,
			);
		}
	}, [done, result, error]);

	const handleAutoMountDirChange = useCallback((checked: boolean) => {
		setAutoMountDir(checked);
		if (checked) {
			setCustomMountDir("");
		}
	}, []);

	const pickFile = useCallback(async () => {
		const file = await open({ multiple: false });
		if (typeof file !== "string") return;

		setPath(file);
		setContainerInfo(null);
		resetContainerInfo();
	}, [resetContainerInfo]);

	const pickMountDir = useCallback(async () => {
		const dir = await open({ directory: true, multiple: false });
		if (typeof dir !== "string") return;
		setCustomMountDir(dir);
	}, []);

	const next = useCallback(async () => {
		if (!path.length) {
			toast.error("Select container file");
			return;
		}

		if (!autoMountDir && !customMountDir.trim()) {
			toast.error("Select folder for extraction");
			return;
		}

		if (!containerInfo) {
			toast.error(
				"Container information is not loaded yet. Please wait a moment.",
			);
			return;
		}

		setBusy(true);
		try {
			const recentItem = recent.find(r => r.path === path);
			const savedMountPath = recentItem?.lastMountPath;

			let mountDir: string;
			if (autoMountDir) {
				mountDir = await getMountPathWithFallback(savedMountPath, path);
			} else {
				mountDir = customMountDir.trim();
			}

			const tokenType =
				(containerInfo.token_type as "master" | "share" | "none") ||
				"none";
			const integrityProvider =
				(containerInfo.integrity_provider_type as "none" | "hmac") ||
				"none";

			dispatch(
				vaultSetOpenWizardState({
					...wizard,
					containerPath: path,
					mountDir,
					autoMountDir,
					customMountDir: autoMountDir ? "" : customMountDir.trim(),
					tokenType,
					integrityProvider,
				}),
			);

			try {
				await saveRecentData(path, dispatch);
			} catch {}

			if (tokenType === "none") {
				navigate(RouteTypes.VaultOpenPassword);
			} else if (tokenType === "master") {
				navigate(RouteTypes.VaultOpenPassword);
			} else if (tokenType === "share") {
				navigate(RouteTypes.VaultOpenShamirMethod);
			}
		} catch (e: unknown) {
			toast.error(String(e));
		} finally {
			setBusy(false);
		}
	}, [
		path,
		autoMountDir,
		customMountDir,
		containerInfo,
		dispatch,
		wizard,
		navigate,
	]);

	return (
		<div>
			<UISectionHeading icon={icons.unlock} text={"Open"} />
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				Step 1 / 6 — Paths
			</p>
			<div className="flex flex-col gap-[20px] p-[20px] bg-white/5 rounded-[10px] mt-[20px]">
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						Path to container:
					</p>
					<div className="flex items-center gap-[10px]">
						<UIInput
							value={path}
							placeholder="Choose"
							style={{ maxWidth: "50%" }}
							readOnly
						/>
						<UIButton
							icon={icons.folder}
							text="Browse"
							onClick={pickFile}
							style={{ width: "fit-content" }}
						/>
					</div>
				</div>
				<div className="flex flex-col gap-[15px]">
					<UICheckbox
						checked={autoMountDir}
						onChange={handleAutoMountDirChange}
						label="Automatically select folder for open container"
					/>
					{!autoMountDir && (
						<div className="flex flex-col gap-[10px]">
							<p className="text-[20px] text-white text-medium">
								Path for open container:
							</p>
							<div className="flex items-center gap-[10px]">
								<UIInput
									value={customMountDir}
									placeholder="Choose"
									style={{ maxWidth: "50%" }}
									onChange={e =>
										setCustomMountDir(e.target.value)
									}
								/>
								<UIButton
									icon={icons.folder}
									text="Browse"
									onClick={pickMountDir}
									style={{ width: "fit-content" }}
								/>
							</div>
						</div>
					)}
				</div>
			</div>
			<div className="flex items-center gap-[10px] mt-[20px]">
				<UIButton
					icon={icons.back}
					text="Back"
					onClick={() => navigate(-1)}
					style={{ width: "fit-content" }}
				/>
				<UIButton
					icon={icons.arrow_right}
					text="Next"
					onClick={next}
					disabled={
						!path.length ||
						(!autoMountDir && !customMountDir.trim()) ||
						!containerInfo ||
						busy
					}
					style={{ width: "fit-content" }}
				/>
			</div>
		</div>
	);
};

export { VaultContainerStep };
