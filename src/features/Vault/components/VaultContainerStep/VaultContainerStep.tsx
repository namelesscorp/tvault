import { open } from "@tauri-apps/plugin-dialog";
import { Store } from "@tauri-apps/plugin-store";
import { useCallback, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RouteTypes } from "interfaces";
import {
	createAsyncOnceGuard,
	devError,
	getLocalizedErrorMessage,
	getMountPathWithFallback,
	useRequestGuard,
} from "utils";
import { useLocale } from "features/Localization";
import { useAppDispatch } from "features/Store";
import { UIButton, UICheckbox, UIInput, UISectionHeading } from "features/UI";
import { icons } from "assets";
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
	const { formatMessage } = useIntl();
	const { locale } = useLocale();
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
	const [userHasInteracted, setUserHasInteracted] = useState(false);

	const { fn: guardedRunContainerInfo, reset: resetContainerInfo } =
		useRequestGuard(runContainerInfo);

	useEffect(() => {
		if (path && !userHasInteracted) {
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
	}, [
		path,
		recent,
		wizard.customMountDir,
		autoMountDir,
		customMountDir,
		userHasInteracted,
	]);

	useEffect(() => {
		if (path && !containerInfo) {
			guardedRunContainerInfo(path).catch(() => {});
		}
	}, [path, containerInfo, guardedRunContainerInfo]);

	useEffect(() => {
		if (done && result && !error) {
			const containerData = result.data;
			if (!containerData) {
				toast.error(
					formatMessage({
						id: "vault.containerStep.containerInfo.error",
					}),
				);
				return;
			}
			setContainerInfo(containerData);
		} else if (error) {
			toast.error(
				`${formatMessage({ id: "vault.containerStep.containerInfo.error" })}: ${getLocalizedErrorMessage(error, formatMessage, locale)}`,
			);
			// Clear path field on error
			setPath("");
			setContainerInfo(null);
		}
	}, [done, result, error]);

	const handleAutoMountDirChange = useCallback((checked: boolean) => {
		setUserHasInteracted(true);
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
		setUserHasInteracted(false);
	}, [resetContainerInfo]);

	const pickMountDir = useCallback(async () => {
		const dir = await open({ directory: true, multiple: false });
		if (typeof dir !== "string") return;
		setUserHasInteracted(true);
		setCustomMountDir(dir);
	}, []);

	const next = useCallback(async () => {
		if (!path.length) {
			toast.error(
				formatMessage({
					id: "vault.containerStep.selectContainer.error",
				}),
			);
			return;
		}

		if (!autoMountDir && !customMountDir.trim()) {
			toast.error(
				formatMessage({
					id: "vault.containerStep.selectMountDir.error",
				}),
			);
			return;
		}

		if (!containerInfo) {
			toast.error(
				formatMessage({
					id: "vault.containerStep.containerInfo.error.description",
				}),
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
			toast.error(getLocalizedErrorMessage(e, formatMessage, locale));
			setPath("");
			setContainerInfo(null);
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
			<UISectionHeading
				icon={icons.unlock}
				text={formatMessage({ id: "title.open" })}
			/>
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				{formatMessage({ id: "vault.containerStep.step" })}
			</p>
			<div className="flex flex-col gap-[20px] p-[20px] bg-white/5 rounded-[10px] mt-[20px]">
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						{formatMessage({ id: "vault.containerStep.path" })}:
					</p>
					<div className="flex items-center gap-[10px]">
						<UIInput
							value={path}
							placeholder={formatMessage({
								id: "common.pathPlaceholder",
							})}
							style={{ maxWidth: "50%" }}
							readOnly
						/>
						<UIButton
							icon={icons.folder}
							text={formatMessage({ id: "common.browse" })}
							onClick={pickFile}
							style={{ width: "fit-content" }}
						/>
					</div>
				</div>
				<div className="flex flex-col gap-[15px]">
					<UICheckbox
						checked={autoMountDir}
						onChange={handleAutoMountDirChange}
						label={formatMessage({
							id: "vault.containerStep.autoMountDir",
						})}
					/>
					{!autoMountDir && (
						<div className="flex flex-col gap-[10px]">
							<p className="text-[20px] text-white text-medium">
								{formatMessage({
									id: "vault.containerStep.pathOpen",
								})}
								:
							</p>
							<div className="flex items-center gap-[10px]">
								<UIInput
									value={customMountDir}
									placeholder={formatMessage({
										id: "common.pathPlaceholder",
									})}
									style={{ maxWidth: "50%" }}
									onChange={e => {
										setUserHasInteracted(true);
										setCustomMountDir(e.target.value);
									}}
								/>
								<UIButton
									icon={icons.folder}
									text={formatMessage({
										id: "common.browse",
									})}
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
					text={formatMessage({ id: "common.back" })}
					onClick={() => navigate(-1)}
					style={{ width: "fit-content" }}
				/>
				<UIButton
					icon={icons.arrow_right}
					text={formatMessage({ id: "common.next" })}
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
