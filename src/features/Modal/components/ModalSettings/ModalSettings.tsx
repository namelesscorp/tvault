import { open, save } from "@tauri-apps/plugin-dialog";
import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { cn } from "utils";
import { appChangeLocale } from "features/App/state/App.actions";
import { selectAppLocale } from "features/App/state/App.selectors";
import { LocalizationTypes } from "features/Localization/Localization.model";
import { useUpdater } from "features/Settings/hooks";
import { useAppDispatch } from "features/Store";
import { useTheme } from "features/Theme";
import { UIImgIcon, UIToggle } from "features/UI";
import { icons } from "assets";
import { modalSetOpen } from "../../state/Modal.actions";

enum SettingsTab {
	Interface = "interface",
	Notifications = "notifications",
	Backup = "backup",
	Updates = "updates",
}

interface NotificationsState {
	unlock: boolean;
	security: boolean;
	updates: boolean;
}

const DEFAULT_NOTIFICATIONS: NotificationsState = {
	unlock: true,
	security: true,
	updates: true,
};

const ModalButton = ({
	icon,
	text,
	onClick,
	disabled = false,
	variant = "neutral",
	width,
}: {
	icon: string;
	text: string;
	onClick?: () => void;
	disabled?: boolean;
	variant?: "blue" | "green" | "neutral";
	width: number;
}) => {
	const { resolved } = useTheme();

	const neutral = variant === "neutral";
	const bg =
		variant === "blue"
			? "#2463EB"
			: variant === "green"
				? "#16853F"
				: undefined;
	const textColor = neutral
		? resolved === "dark"
			? "#ffffff"
			: "rgba(0, 0, 0, 0.7)"
		: "#ffffff";

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			style={{ width: `${width}px`, backgroundColor: bg }}
			className={cn(
				"flex items-center justify-center gap-[10px] h-[40px] rounded-[10px] border text-[16px] font-medium tracking-[-0.05em] whitespace-nowrap transition-all duration-300 cursor-pointer",
				{
					"bg-white/3 border-[#313A4F]":
						neutral && resolved === "dark",
					"bg-white/80 border-black/70":
						neutral && resolved === "light",
					"border-transparent": !neutral,
					"opacity-50 cursor-default": disabled,
				},
			)}>
			<UIImgIcon icon={icon} width={20} height={20} color={textColor} />
			<span style={{ color: textColor }}>{text}</span>
		</button>
	);
};

const LanguageSelect = () => {
	const dispatch = useAppDispatch();
	const { resolved } = useTheme();
	const language = useSelector(selectAppLocale);

	const [isOpen, setIsOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	const options = [
		{ value: LocalizationTypes.English, label: "English" },
		{ value: LocalizationTypes.Russian, label: "Русский" },
	];
	const current = options.find(option => option.value === language);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSelect = (value: LocalizationTypes) => {
		dispatch(appChangeLocale(value));
		setIsOpen(false);
	};

	return (
		<div ref={ref} className="relative shrink-0">
			<button
				type="button"
				onClick={() => setIsOpen(prev => !prev)}
				className={cn(
					"flex items-center justify-center w-[200px] h-[30px] rounded-[10px] border text-[14px] font-medium tracking-[-0.05em] transition-all duration-300 cursor-pointer",
					{
						"bg-white/3 border-[#313A4F] text-white/70":
							resolved === "dark",
						"bg-white/80 border-black/70 text-black/70":
							resolved === "light",
					},
				)}>
				{current?.label}
			</button>
			{isOpen && (
				<div
					className={cn(
						"absolute top-full right-0 mt-[6px] w-[200px] rounded-[10px] border overflow-hidden z-10",
						{
							"bg-[#1E293B] border-[#313A4F]":
								resolved === "dark",
							"bg-white border-black/70": resolved === "light",
						},
					)}>
					{options.map(option => (
						<div
							key={option.value}
							onClick={() => handleSelect(option.value)}
							className={cn(
								"px-[15px] py-[10px] text-[14px] font-medium tracking-[-0.05em] cursor-pointer transition-all duration-200",
								{
									"text-white/70 hover:bg-white/5":
										resolved === "dark",
									"text-black/70 hover:bg-black/5":
										resolved === "light",
									"bg-[#2463EB]/15":
										option.value === language,
								},
							)}>
							{option.label}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

const SettingsRow = ({
	title,
	description,
	control,
}: {
	title: string;
	description: string;
	control: React.ReactNode;
}) => {
	const { resolved } = useTheme();

	return (
		<div
			className={cn(
				"flex items-center justify-between gap-[20px] min-h-[42px] py-[15px] first:pt-0 last:pb-0 border-b last:border-b-0",
				{
					"border-[#313A4F]": resolved === "dark",
					"border-black/70": resolved === "light",
				},
			)}>
			<div className="flex flex-col gap-[7px]">
				<p
					className={cn(
						"text-[18px] font-medium tracking-[-0.05em]",
						{
							"text-white": resolved === "dark",
							"text-black/80": resolved === "light",
						},
					)}>
					{title}
				</p>
				<p
					className={cn(
						"text-[11px] font-semibold tracking-[-0.05em]",
						{
							"text-white/70": resolved === "dark",
							"text-black/70": resolved === "light",
						},
					)}>
					{description}
				</p>
			</div>
			<div className="shrink-0">{control}</div>
		</div>
	);
};

const ModalSettings = () => {
	const { formatMessage } = useIntl();
	const { resolved, setPreference } = useTheme();
	const dispatch = useAppDispatch();

	const [mounted, setMounted] = useState(false);
	const [activeTab, setActiveTab] = useState<SettingsTab>(
		SettingsTab.Interface,
	);
	const [notifications, setNotifications] = useState<NotificationsState>(
		DEFAULT_NOTIFICATIONS,
	);
	const [importPath, setImportPath] = useState("");

	const {
		isChecking,
		isDownloading,
		isInstalling,
		currentVersion,
		updateAvailable,
		updateDownloaded,
		initializeVersion,
		checkForUpdates,
		downloadUpdate,
		installUpdate,
	} = useUpdater();

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		initializeVersion();
	}, [initializeVersion]);

	const handleClose = () => dispatch(modalSetOpen(false));

	const handleReset = () => {
		setNotifications(DEFAULT_NOTIFICATIONS);
		setImportPath("");
	};

	const handleImport = async () => {
		const file = await open({
			multiple: false,
			filters: [{ name: "Settings", extensions: ["tvlt"] }],
		});
		if (typeof file === "string") {
			setImportPath(file);
		}
	};

	const handleExport = async () => {
		await save({
			filters: [{ name: "Settings", extensions: ["tvlt"] }],
		});
	};

	const tabs = [
		{ key: SettingsTab.Interface, label: "settings.modal.tabs.interface" },
		{
			key: SettingsTab.Notifications,
			label: "settings.modal.tabs.notifications",
		},
		{ key: SettingsTab.Backup, label: "settings.modal.tabs.backup" },
		{ key: SettingsTab.Updates, label: "settings.modal.tabs.updates" },
	];

	return (
		<div
			className={cn(
				"fixed top-0 left-0 w-full h-full flex items-center justify-center backdrop-blur-sm transition-opacity duration-300",
				mounted ? "opacity-100" : "opacity-0",
			)}>
			<div
				className={cn(
					"w-[1000px] max-w-[96vw] rounded-[10px] flex flex-col transition-all duration-300 origin-center",
					mounted ? "opacity-100 scale-100" : "opacity-0 scale-95",
					{
						"bg-[#1E293B]": resolved === "dark",
						"bg-[#F5F7FF]": resolved === "light",
					},
				)}>
				{/* header */}
				<div className="flex items-center justify-between px-[15px] py-[22px]">
					<div className="flex items-center gap-[10px]">
						<div
							className={cn(
								"flex items-center justify-center w-[50px] h-[50px] rounded-[10px] shrink-0",
								{
									"bg-[#20314D]": resolved === "dark",
									"bg-[#9AC7FF]": resolved === "light",
								},
							)}>
							<UIImgIcon
								icon={icons.settings}
								width={30}
								height={30}
								color={
									resolved === "dark" ? "#538DD5" : "#1353A3"
								}
							/>
						</div>
						<p
							className={cn(
								"text-[24px] font-bold tracking-[-0.05em]",
								{
									"text-white": resolved === "dark",
									"text-black/80": resolved === "light",
								},
							)}>
							{formatMessage({ id: "settings.title" })}
						</p>
					</div>
					<UIImgIcon
						icon={icons.close}
						width={13}
						height={13}
						color={resolved === "dark" ? "#ffffff" : "#000000"}
						pointer
						onClick={handleClose}
					/>
				</div>

				{/* subtitle */}
				<p
					className={cn(
						"px-[15px] text-[16px] font-medium tracking-[-0.05em]",
						{
							"text-white/70": resolved === "dark",
							"text-black/70": resolved === "light",
						},
					)}>
					{formatMessage({ id: "settings.modal.subtitle" })}
				</p>

				{/* tabs */}
				<div className="px-[15px] pt-[20px]">
					<div
						className={cn(
							"flex items-stretch rounded-[10px] border overflow-hidden",
							{
								"bg-white/3 border-[#313A4F]":
									resolved === "dark",
								"bg-white/80 border-[#313A4F]":
									resolved === "light",
							},
						)}>
						{tabs.map((tab, index) => {
							const active = activeTab === tab.key;
							return (
								<button
									key={tab.key}
									type="button"
									onClick={() => setActiveTab(tab.key)}
									className={cn(
										"flex-1 h-[40px] text-[16px] font-medium tracking-[-0.05em] transition-all duration-300 cursor-pointer",
										{
											"border-l": index !== 0,
											"border-[#313A4F]": index !== 0,
											"text-white": resolved === "dark",
											"text-black/70":
												resolved === "light",
											"bg-white/8":
												active && resolved === "dark",
											"bg-black/5":
												active && resolved === "light",
											"hover:bg-white/5":
												!active && resolved === "dark",
											"hover:bg-black/3":
												!active && resolved === "light",
										},
									)}>
									{formatMessage({ id: tab.label })}
								</button>
							);
						})}
					</div>
				</div>

				{/* body card */}
				<div className="px-[15px] pt-[20px]">
					<div
						className={cn(
							"min-h-[330px] px-[15px] py-[15px] rounded-[10px] border",
							{
								"bg-white/3 border-[#313A4F]":
									resolved === "dark",
								"bg-white/80 border-black/70":
									resolved === "light",
							},
						)}>
						{activeTab === SettingsTab.Interface && (
							<>
								<SettingsRow
									title={formatMessage({
										id: "settings.modal.darkMode.title",
									})}
									description={formatMessage({
										id: "settings.modal.darkMode.description",
									})}
									control={
										<UIToggle
											checked={resolved === "dark"}
											onChange={next =>
												setPreference(
													next ? "dark" : "light",
												)
											}
										/>
									}
								/>
								<SettingsRow
									title={formatMessage({
										id: "settings.modal.language.title",
									})}
									description={formatMessage({
										id: "settings.modal.language.description",
									})}
									control={<LanguageSelect />}
								/>
							</>
						)}

						{activeTab === SettingsTab.Notifications && (
							<>
								<SettingsRow
									title={formatMessage({
										id: "settings.modal.notifications.unlock.title",
									})}
									description={formatMessage({
										id: "settings.modal.notifications.unlock.description",
									})}
									control={
										<UIToggle
											checked={notifications.unlock}
											onChange={next =>
												setNotifications(prev => ({
													...prev,
													unlock: next,
												}))
											}
										/>
									}
								/>
								<SettingsRow
									title={formatMessage({
										id: "settings.modal.notifications.security.title",
									})}
									description={formatMessage({
										id: "settings.modal.notifications.security.description",
									})}
									control={
										<UIToggle
											checked={notifications.security}
											onChange={next =>
												setNotifications(prev => ({
													...prev,
													security: next,
												}))
											}
										/>
									}
								/>
								<SettingsRow
									title={formatMessage({
										id: "settings.modal.notifications.updates.title",
									})}
									description={formatMessage({
										id: "settings.modal.notifications.updates.description",
									})}
									control={
										<UIToggle
											checked={notifications.updates}
											onChange={next =>
												setNotifications(prev => ({
													...prev,
													updates: next,
												}))
											}
										/>
									}
								/>
							</>
						)}

						{activeTab === SettingsTab.Backup && (
							<>
								<SettingsRow
									title={formatMessage({
										id: "settings.modal.backup.import.title",
									})}
									description={formatMessage({
										id: "settings.modal.backup.import.description",
									})}
									control={
										<div className="flex items-center gap-[10px]">
											<input
												value={importPath}
												readOnly
												placeholder={formatMessage({
													id: "settings.modal.backup.import.placeholder",
												})}
												className={cn(
													"w-[275px] h-[40px] px-[14px] rounded-[10px] border text-[16px] font-medium tracking-[-0.05em] outline-none",
													{
														"bg-white/3 border-[#313A4F] text-white placeholder:text-white/70":
															resolved === "dark",
														"bg-white/80 border-black/70 text-black placeholder:text-black/70":
															resolved ===
															"light",
													},
												)}
											/>
											<ModalButton
												icon={icons.eye}
												text={formatMessage({
													id: "common.browse",
												})}
												onClick={handleImport}
												variant="green"
												width={121}
											/>
										</div>
									}
								/>
								<SettingsRow
									title={formatMessage({
										id: "settings.modal.backup.export.title",
									})}
									description={formatMessage({
										id: "settings.modal.backup.export.description",
									})}
									control={
										<ModalButton
											icon={icons.upload}
											text={formatMessage({
												id: "common.export",
											})}
											onClick={handleExport}
											variant="blue"
											width={121}
										/>
									}
								/>
							</>
						)}

						{activeTab === SettingsTab.Updates && (
							<SettingsRow
								title={formatMessage({
									id: "settings.modal.updates.title",
								})}
								description={formatMessage(
									{
										id: "settings.modal.updates.description",
									},
									{ version: currentVersion },
								)}
								control={
									!updateAvailable ? (
										<ModalButton
											icon={icons.refresh}
											text={formatMessage({
												id: "settings.checkUpdates",
											})}
											onClick={checkForUpdates}
											disabled={
												isChecking ||
												isDownloading ||
												isInstalling
											}
											variant="blue"
											width={200}
										/>
									) : !updateDownloaded ? (
										<ModalButton
											icon={icons.download}
											text={formatMessage({
												id: "settings.downloadUpdate",
											})}
											onClick={downloadUpdate}
											disabled={
												isDownloading || isInstalling
											}
											variant="blue"
											width={200}
										/>
									) : (
										<ModalButton
											icon={icons.download}
											text={formatMessage({
												id: "settings.modal.updates.install",
											})}
											onClick={installUpdate}
											disabled={isInstalling}
											variant="blue"
											width={200}
										/>
									)
								}
							/>
						)}
					</div>
				</div>

				{/* footer */}
				<div
					className={cn("mt-[20px] mx-[15px] border-t", {
						"border-[#313A4F]": resolved === "dark",
						"border-black/70": resolved === "light",
					})}
				/>
				<div className="flex items-center justify-between px-[15px] py-[20px]">
					<ModalButton
						icon={icons.reverse}
						text={formatMessage({ id: "common.reset" })}
						onClick={handleReset}
						variant="neutral"
						width={200}
					/>
					<ModalButton
						icon={icons.save}
						text={formatMessage({ id: "common.save" })}
						onClick={handleClose}
						variant="blue"
						width={200}
					/>
				</div>
			</div>
		</div>
	);
};

export { ModalSettings };
