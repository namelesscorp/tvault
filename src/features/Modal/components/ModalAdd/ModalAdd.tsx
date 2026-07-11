import { open } from "@tauri-apps/plugin-dialog";
import { ReactNode, useCallback, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import { RouteTypes } from "interfaces";
import { cn } from "utils";
import { modalSetOpen } from "features/Modal/state/Modal.actions";
import { appNavigate } from "features/Router/navigation";
import { useAppDispatch } from "features/Store";
import { useTheme } from "features/Theme";
import { UIButton, UIImgIcon, UIInput } from "features/UI";
import {
	vaultAddContainersPathAndScan,
	vaultAddRecentContainer,
	vaultSetOpenWizardState,
} from "features/Vault/state/Vault.actions";
import { icons } from "assets";

const GREEN = "#16853F";

const ModalAdd = () => {
	const { formatMessage } = useIntl();
	const { resolved } = useTheme();
	const dispatch = useAppDispatch();

	const [filePath, setFilePath] = useState("");
	const [folderPath, setFolderPath] = useState("");

	const pickFile = useCallback(async () => {
		const file = await open({ multiple: false });
		if (typeof file === "string") setFilePath(file);
	}, []);

	const pickFolder = useCallback(async () => {
		const dir = await open({ directory: true, multiple: false });
		if (typeof dir === "string") setFolderPath(dir);
	}, []);

	const handleAdd = useCallback(async () => {
		if (!filePath && !folderPath) {
			toast.error(formatMessage({ id: "modal.add.error.empty" }));
			return;
		}
		if (folderPath) {
			await dispatch(vaultAddContainersPathAndScan(folderPath));
			toast.success(formatMessage({ id: "modal.add.success.folder" }));
		}
		if (filePath) {
			await dispatch(vaultAddRecentContainer(filePath));
			toast.success(formatMessage({ id: "modal.add.success.file" }));
		}
		dispatch(modalSetOpen(false));
	}, [dispatch, filePath, folderPath, formatMessage]);

	const handleUnlock = useCallback(() => {
		if (!filePath) {
			toast.error(formatMessage({ id: "modal.add.error.noFile" }));
			return;
		}
		dispatch(
			vaultSetOpenWizardState({
				containerPath: filePath,
				mountDir: "",
				autoMountDir: true,
				customMountDir: "",
				tokenType: "none",
				integrityProvider: "none",
				method: "password",
				lastStep: undefined,
				decryptCompleted: false,
				decryptResult: undefined,
			}),
		);
		dispatch(modalSetOpen(false));
		appNavigate(RouteTypes.VaultOpenContainer);
	}, [dispatch, filePath, formatMessage]);

	return (
		<div>
			<p
				className={cn("text-[16px] font-medium tracking-[-0.05em] ", {
					"text-white/70": resolved === "dark",
					"text-black/70": resolved === "light",
				})}>
				{formatMessage({ id: "modal.add.info.title" })}
			</p>
			<div className="flex flex-col gap-[20px] mt-[20px]">
				<Section icon={icons.key_2} title="modal.add.file.title">
					<p
						className={cn(
							"text-[16px] font-medium tracking-[-0.05em] ",
							{
								"text-white/70": resolved === "dark",
								"text-black/70": resolved === "light",
							},
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
					<p
						className={cn(
							"text-[16px] font-medium tracking-[-0.05em] ",
							{
								"text-white/70": resolved === "dark",
								"text-black/70": resolved === "light",
							},
						)}>
						{formatMessage({ id: "modal.add.folder.description" })}
					</p>
					<PathPicker
						label="modal.add.folder.input.title"
						placeholder="modal.add.folder.input.placeholder"
						value={folderPath}
						onBrowse={pickFolder}
					/>
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
					style={{ backgroundColor: GREEN, color: "#ffffff" }}
				/>
				<UIButton
					icon={icons.lock}
					text={formatMessage({ id: "common.unlock" })}
					onClick={handleUnlock}
					color="#ffffff"
					noTheme
					center
					style={{
						backgroundColor:
							resolved === "dark" ? "#2463EB" : "#3A73ED",
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
	const { resolved } = useTheme();

	return (
		<div
			className={cn(
				"w-full flex flex-col gap-[10px] border rounded-[10px] p-[15px]",
				{
					"bg-white/3": resolved === "dark",
					"bg-white/80": resolved === "light",
					"border-[#313A4F]": resolved === "dark",
					"border-black/70": resolved === "light",
				},
			)}>
			<div className="flex items-center gap-[10px]">
				<UIImgIcon icon={icon} width={28} height={28} color="#538DD5" />
				<p
					className={cn(
						"text-[16px] font-semibold tracking-[-0.05em] ",
						{
							"text-white": resolved === "dark",
							"text-black": resolved === "light",
						},
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
	const { resolved } = useTheme();

	return (
		<div className="flex flex-col gap-[10px] mt-[10px]">
			<p
				className={cn("text-[14px] font-semibold tracking-[-0.05em]", {
					"text-white": resolved === "dark",
					"text-black": resolved === "light",
				})}>
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
