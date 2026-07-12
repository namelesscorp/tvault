import { open } from "@tauri-apps/plugin-dialog";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
	cn,
	getLocalizedErrorMessage,
	getMountPathWithFallback,
	useRequestGuard,
} from "utils";
import { useLocale } from "features/Localization";
import { ModalTypes } from "features/Modal/Modal.model";
import {
	modalSetIcon,
	modalSetOpen,
	modalSetTitle,
	modalSetType,
} from "features/Modal/state/Modal.actions";
import { useAppDispatch } from "features/Store";
import { UIButton, UIImgIcon, UIInput, UIToggle } from "features/UI";
import { useContainerInfo } from "features/Vault/hooks/useContainerInfo";
import {
	vaultAddRecentContainer,
	vaultSetOpenWizardState,
} from "features/Vault/state/Vault.actions";
import { selectVaultRecent } from "features/Vault/state/Vault.selectors";
import { icons } from "assets";

const GREEN = "#16853F";

const ModalAdd = () => {
	const { formatMessage } = useIntl();
	const { locale } = useLocale();
	const dispatch = useAppDispatch();
	const recent = useSelector(selectVaultRecent);

	const { run: runContainerInfo, done, result, error } = useContainerInfo();
	const { fn: guardedRunContainerInfo, reset: resetContainerInfo } =
		useRequestGuard(runContainerInfo);

	const [filePath, setFilePath] = useState("");
	const [autoMountDir, setAutoMountDir] = useState(true);
	const [customMountDir, setCustomMountDir] = useState("");
	const [containerInfo, setContainerInfo] = useState<any>(null);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		if (done && result && !error) {
			const data = result.data;
			if (!data) {
				toast.error(
					formatMessage({
						id: "vault.containerStep.containerInfo.error",
					}),
				);
				return;
			}
			setContainerInfo(data);
		} else if (error) {
			toast.error(
				`${formatMessage({ id: "vault.containerStep.containerInfo.error" })}: ${getLocalizedErrorMessage(error, formatMessage, locale)}`,
			);
			setFilePath("");
			setContainerInfo(null);
		}
	}, [done, result, error]);

	const pickFile = useCallback(async () => {
		const file = await open({ multiple: false });
		if (typeof file !== "string") return;

		setFilePath(file);
		setContainerInfo(null);
		resetContainerInfo();
		guardedRunContainerInfo(file).catch(() => {});
	}, [guardedRunContainerInfo, resetContainerInfo]);

	const pickFolder = useCallback(async () => {
		const dir = await open({ directory: true, multiple: false });
		if (typeof dir === "string") setCustomMountDir(dir);
	}, []);

	const handleAutoMountDirChange = useCallback((checked: boolean) => {
		setAutoMountDir(checked);
		if (checked) setCustomMountDir("");
	}, []);

	const handleAdd = useCallback(async () => {
		if (!filePath) {
			toast.error(formatMessage({ id: "modal.add.error.empty" }));
			return;
		}
		await dispatch(vaultAddRecentContainer(filePath));
		toast.success(formatMessage({ id: "modal.add.success.file" }));
		dispatch(modalSetOpen(false));
	}, [dispatch, filePath, formatMessage]);

	const handleUnlock = useCallback(async () => {
		if (!filePath) {
			toast.error(formatMessage({ id: "modal.add.error.noFile" }));
			return;
		}
		if (!autoMountDir && !customMountDir.trim()) {
			toast.error(formatMessage({ id: "modal.add.error.noFolder" }));
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
			const savedMountPath = recent.find(
				r => r.path === filePath,
			)?.lastMountPath;

			const mountDir = autoMountDir
				? await getMountPathWithFallback(savedMountPath, filePath)
				: customMountDir.trim();

			const tokenType =
				(containerInfo.token_type as "master" | "share" | "none") ||
				"none";
			const integrityProvider =
				(containerInfo.integrity_provider_type as "none" | "hmac") ||
				"none";

			dispatch(
				vaultSetOpenWizardState({
					containerPath: filePath,
					mountDir,
					autoMountDir,
					customMountDir: autoMountDir ? "" : customMountDir.trim(),
					tokenType,
					integrityProvider,
					method: tokenType === "share" ? "shamir" : "password",
					quickOpen: true,
					decryptCompleted: false,
					decryptResult: undefined,
				}),
			);

			dispatch(modalSetTitle(formatMessage({ id: "modal.unlock" })));
			dispatch(modalSetIcon(icons.folder_shield));
			dispatch(modalSetType(ModalTypes.OPEN));
			dispatch(modalSetOpen(true));
		} catch (e: unknown) {
			toast.error(getLocalizedErrorMessage(e, formatMessage, locale));
		} finally {
			setBusy(false);
		}
	}, [
		autoMountDir,
		containerInfo,
		customMountDir,
		dispatch,
		filePath,
		formatMessage,
		locale,
		recent,
	]);

	return (
		<div>
			<p
				className={cn(
					"text-[16px] font-medium tracking-[-0.05em]  text-muted",
				)}>
				{formatMessage({ id: "modal.add.info.title" })}
			</p>
			<div className="flex flex-col gap-[20px] mt-[20px]">
				<Section
					icon={icons.file_attachment}
					title="modal.add.file.title">
					<p
						className={cn(
							"text-[16px] font-medium tracking-[-0.05em]  text-muted",
						)}>
						{formatMessage({ id: "modal.add.file.description.1" })}{" "}
						<span className="font-semibold italic">*.tvlt</span>{" "}
						{formatMessage({ id: "modal.add.file.description.2" })}
					</p>
					<PathPicker
						label="modal.add.file.input.title"
						placeholder="modal.add.file.input.placeholder"
						value={filePath}
						onBrowse={pickFile}
					/>
				</Section>

				<Section icon={icons.folder} title="modal.add.folder.title">
					{!autoMountDir && (
						<>
							<p
								className={cn(
									"text-[16px] font-medium tracking-[-0.05em]  text-muted",
								)}>
								{formatMessage({
									id: "modal.add.folder.description",
								})}
							</p>
							<PathPicker
								label="modal.add.folder.input.title"
								placeholder="modal.add.folder.input.placeholder"
								value={customMountDir}
								onBrowse={pickFolder}
							/>
						</>
					)}
					<div className="flex items-center justify-between gap-[20px]">
						<p
							className={cn(
								"text-[16px] font-medium tracking-[-0.05em] text-muted",
							)}>
							{formatMessage({ id: "modal.add.folder.auto" })}
						</p>
						<UIToggle
							checked={autoMountDir}
							onChange={handleAutoMountDirChange}
						/>
					</div>
				</Section>
			</div>

			<div className="flex items-center gap-[10px] mt-[20px]">
				<UIButton
					icon={icons.plus}
					text={formatMessage({ id: "common.add" })}
					onClick={handleAdd}
					color="#ffffff"
					noTheme
					center
					disabled={busy}
					style={{ backgroundColor: GREEN, color: "#ffffff" }}
				/>
				<UIButton
					icon={icons.unlock}
					text={formatMessage({ id: "common.unlock" })}
					onClick={handleUnlock}
					color="#ffffff"
					noTheme
					center
					disabled={busy}
					style={{
						backgroundColor: "var(--accent-blue)",
						color: "#ffffff",
					}}
				/>
			</div>
		</div>
	);
};

const Section = ({
	icon,
	title,
	children,
}: {
	icon: string;
	title: string;
	children: ReactNode;
}) => {
	const { formatMessage } = useIntl();

	return (
		<div
			className={cn(
				"w-full flex flex-col gap-[10px] border rounded-[10px] p-[15px] bg-surface border-line",
			)}>
			<div className="flex items-center gap-[10px]">
				<UIImgIcon icon={icon} width={29} height={29} color="#538DD5" />
				<p
					className={cn(
						"text-[16px] font-semibold tracking-[-0.05em]  text-fg-strong",
					)}>
					{formatMessage({ id: title })}
				</p>
			</div>
			{children}
		</div>
	);
};

const PathPicker = ({
	label,
	placeholder,
	value,
	onBrowse,
}: {
	label: string;
	placeholder: string;
	value: string;
	onBrowse: () => void;
}) => {
	const { formatMessage } = useIntl();

	return (
		<div className="flex flex-col gap-[10px] mt-[10px]">
			<p
				className={cn(
					"text-[14px] font-semibold tracking-[-0.05em] text-fg-strong",
				)}>
				{formatMessage({ id: label })}
			</p>
			<div className="flex items-center gap-[10px]">
				<UIInput
					value={value}
					placeholder={formatMessage({ id: placeholder })}
					style={{ width: 275 }}
					readOnly
				/>
				<UIButton
					icon={icons.eye}
					text={formatMessage({ id: "common.browse" })}
					onClick={onBrowse}
					style={{
						width: "fit-content",
						backgroundColor: GREEN,
						color: "#ffffff",
					}}
					color="#ffffff"
					noTheme
				/>
			</div>
		</div>
	);
};

export { ModalAdd };
