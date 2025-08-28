import { open } from "@tauri-apps/plugin-dialog";
import { useCallback, useEffect } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RouteTypes } from "interfaces";
import { appChangeLocale } from "features/App/state/App.actions";
import { selectAppLocale } from "features/App/state/App.selectors";
import { LocalizationTypes } from "features/Localization/Localization.model";
import { useUpdater } from "features/Settings/hooks";
import { useAppDispatch } from "features/Store";
import { UIButton, UIInput, UISectionHeading, UISelect } from "features/UI";
import {
	vaultChangeContainersPath,
	vaultScanContainersDirectory,
} from "features/Vault/state/Vault.actions";
import { selectVaultContainersPath } from "features/Vault/state/Vault.selectors";
import { icons } from "assets";

const Settings = () => {
	const { formatMessage } = useIntl();
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const containersPath = useSelector(selectVaultContainersPath);
	const language = useSelector(selectAppLocale);

	const {
		isChecking,
		isDownloading,
		isInstalling,
		currentVersion,
		latestVersion,
		updateAvailable,
		updateDownloaded,
		error,
		initializeVersion,
		checkForUpdates,
		downloadUpdate,
		installUpdate,
	} = useUpdater();

	const languageOptions = [
		{ value: LocalizationTypes.Russian, label: "Русский" },
		{ value: LocalizationTypes.English, label: "English" },
	];

	useEffect(() => {
		initializeVersion();
	}, [initializeVersion]);

	const pickFolder = useCallback(async () => {
		const dir = await open({ directory: true, multiple: false });
		if (typeof dir === "string") {
			await dispatch(vaultChangeContainersPath(dir));
			await dispatch(vaultScanContainersDirectory(dir));
		}
	}, [dispatch]);

	const handleLanguageChange = useCallback(
		(newLanguage: string) => {
			dispatch(appChangeLocale(newLanguage as LocalizationTypes));
		},
		[dispatch],
	);

	const handleCheckUpdates = useCallback(async () => {
		await checkForUpdates();
	}, [checkForUpdates]);

	const handleDownloadUpdate = useCallback(async () => {
		await downloadUpdate();
	}, [downloadUpdate]);

	const handleInstallUpdate = useCallback(async () => {
		await installUpdate();
	}, [installUpdate]);

	return (
		<section>
			<UISectionHeading
				icon={icons.settings}
				text={formatMessage({ id: "settings.title" })}
			/>
			<div className="flex flex-col gap-[20px] p-[20px] bg-white/5 rounded-[10px] mt-[20px]">
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						{formatMessage({ id: "settings.containersPath" })}:
					</p>
					<div className="flex items-center gap-[10px]">
						<UIInput
							value={containersPath}
							placeholder={formatMessage({
								id: "common.pathPlaceholder",
							})}
							style={{ maxWidth: "50%" }}
							readOnly
						/>
						<UIButton
							icon={icons.folder}
							text={formatMessage({ id: "common.browse" })}
							onClick={pickFolder}
							style={{ width: "fit-content" }}
						/>
					</div>
				</div>
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						{formatMessage({ id: "settings.language" })}:
					</p>
					<UISelect
						value={language}
						onChange={handleLanguageChange}
						options={languageOptions}
						placeholder={formatMessage({
							id: "settings.selectLanguage",
						})}
						style={{ maxWidth: "50%" }}
					/>
				</div>
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						{formatMessage({ id: "settings.updates" })}:
					</p>
					<div className="flex flex-col gap-[10px]">
						<div className="flex items-center gap-[10px]">
							<span className="text-white/70">
								{formatMessage({
									id: "settings.currentVersion",
								})}
								: {currentVersion}
							</span>
						</div>
						{latestVersion && (
							<div className="flex items-center gap-[10px]">
								<span className="text-white/70">
									{formatMessage({
										id: "settings.latestVersion",
									})}
									: {latestVersion}
								</span>
							</div>
						)}
						{error && (
							<div className="text-red-400 text-sm">{error}</div>
						)}
						<div className="flex items-center gap-[10px]">
							{!updateAvailable && (
								<UIButton
									icon={icons.refresh}
									text={formatMessage({
										id: "settings.checkUpdates",
									})}
									onClick={handleCheckUpdates}
									disabled={
										isChecking ||
										isDownloading ||
										isInstalling
									}
									style={{ width: "fit-content" }}
								/>
							)}
							{updateAvailable && !updateDownloaded && (
								<UIButton
									icon={icons.download}
									text={formatMessage({
										id: "settings.downloadUpdate",
									})}
									onClick={handleDownloadUpdate}
									disabled={isDownloading || isInstalling}
									style={{ width: "fit-content" }}
								/>
							)}
							{updateDownloaded && updateAvailable && (
								<UIButton
									icon={icons.refresh}
									text={formatMessage({
										id: "settings.restartToUpdate",
									})}
									onClick={handleInstallUpdate}
									disabled={isInstalling}
									style={{ width: "fit-content" }}
								/>
							)}
						</div>
						{isChecking && (
							<div className="text-blue-400 text-sm">
								{formatMessage({ id: "settings.checkUpdates" })}
								...
							</div>
						)}
						{isDownloading && (
							<div className="text-blue-400 text-sm">
								{formatMessage({
									id: "settings.downloadingUpdate",
								})}
								...
							</div>
						)}
						{isInstalling && (
							<div className="text-blue-400 text-sm">
								{formatMessage({
									id: "settings.installingUpdate",
								})}
								...
							</div>
						)}
						{updateAvailable &&
							!isChecking &&
							!isDownloading &&
							!isInstalling && (
								<div className="text-green-400 text-sm">
									{formatMessage({
										id: "settings.updateAvailable",
									})}
								</div>
							)}
						{!updateAvailable && !isChecking && currentVersion && (
							<div className="text-gray-400 text-sm">
								{formatMessage({
									id: "settings.updateNotAvailable",
								})}
							</div>
						)}
					</div>
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
					icon={icons.save}
					text={formatMessage({ id: "common.save" })}
					onClick={() => navigate(RouteTypes.Dashboard)}
					style={{ width: "fit-content" }}
				/>
			</div>
		</section>
	);
};

export { Settings };
