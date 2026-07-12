import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { useCallback, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { devError, devInfo } from "utils";
import { useAnimations, useAutoUpdate } from "features/App";
import { appChangeLocale } from "features/App/state/App.actions";
import { selectAppLocale } from "features/App/state/App.selectors";
import { useAppDispatch } from "features/Store";
import { useTheme } from "features/Theme";
import {
	isContainerAccessible,
	saveRecentToStore,
	vaultAddContainersPathAndScan,
	vaultSetRecent,
} from "features/Vault/state/Vault.actions";
import {
	selectVaultContainersPaths,
	selectVaultRecent,
} from "features/Vault/state/Vault.selectors";
import {
	SETTINGS_FILE_FORMAT,
	SETTINGS_FILE_NAME,
	SETTINGS_FILE_VERSION,
	SettingsFile,
	parseSettingsFile,
} from "../Settings.model";

const JSON_FILTER = [{ name: "Settings", extensions: ["json"] }];

export const useSettingsBackup = () => {
	const { formatMessage } = useIntl();
	const dispatch = useAppDispatch();

	const { preference: theme, setPreference: setTheme } = useTheme();
	const { enabled: animations, setEnabled: setAnimations } = useAnimations();
	const { enabled: autoUpdate, setEnabled: setAutoUpdate } = useAutoUpdate();
	const locale = useSelector(selectAppLocale);
	const containersPaths = useSelector(selectVaultContainersPaths);
	const recent = useSelector(selectVaultRecent);

	/** Shown in the read-only field next to the browse button. */
	const [importPath, setImportPath] = useState("");
	const [busy, setBusy] = useState(false);

	const exportSettings = useCallback(async () => {
		const path = await save({
			defaultPath: SETTINGS_FILE_NAME,
			filters: JSON_FILTER,
		});
		if (!path) {
			return;
		}

		setBusy(true);
		try {
			const file: SettingsFile = {
				format: SETTINGS_FILE_FORMAT,
				version: SETTINGS_FILE_VERSION,
				app: APP_VERSION,
				exportedAt: new Date().toISOString(),
				theme,
				locale,
				animations,
				autoUpdate,
				containersPaths,
				recent: recent.map(item => ({
					path: item.path,
					lastOpenedAt: item.lastOpenedAt,
				})),
			};

			await writeTextFile(path, JSON.stringify(file, null, 2));
			devInfo("Exported settings to:", path);
			toast.success(formatMessage({ id: "settings.backup.exported" }));
		} catch (e) {
			devError("Failed to export settings", e);
			toast.error(formatMessage({ id: "settings.backup.error.export" }));
		} finally {
			setBusy(false);
		}
	}, [
		theme,
		locale,
		animations,
		autoUpdate,
		containersPaths,
		recent,
		formatMessage,
	]);

	const importSettings = useCallback(async () => {
		const path = await open({ multiple: false, filters: JSON_FILTER });
		if (typeof path !== "string") {
			return;
		}

		setBusy(true);
		try {
			const file = parseSettingsFile(await readTextFile(path));
			if (!file) {
				toast.error(
					formatMessage({ id: "settings.backup.error.format" }),
				);
				return;
			}

			if (file.theme) setTheme(file.theme);
			if (file.locale) dispatch(appChangeLocale(file.locale));
			if (typeof file.animations === "boolean")
				setAnimations(file.animations);
			if (typeof file.autoUpdate === "boolean")
				setAutoUpdate(file.autoUpdate);

			/** Adds the folder, persists it and scans it for containers. */
			for (const folder of file.containersPaths ?? []) {
				if (containersPaths.includes(folder)) continue;
				await dispatch(vaultAddContainersPathAndScan(folder));
			}

			/**
			 * The dashboard list is merged, not replaced — importing on a machine that
			 * already has vaults should add to them. Entries whose file is not on this
			 * machine are dropped, or the dashboard would fill up with dead cards.
			 */
			if (file.recent?.length) {
				const known = new Set(recent.map(item => item.path));
				const incoming = [];

				for (const item of file.recent) {
					if (known.has(item.path)) continue;
					if (!(await isContainerAccessible(item.path))) {
						devInfo("Skipping missing container:", item.path);
						continue;
					}
					incoming.push(item);
				}

				if (incoming.length > 0) {
					const merged = [...recent, ...incoming]
						.sort((a, b) => b.lastOpenedAt - a.lastOpenedAt)
						.slice(0, 100);
					dispatch(vaultSetRecent(merged));
					await saveRecentToStore(merged);
				}
			}

			setImportPath(path);
			devInfo("Imported settings from:", path);
			toast.success(formatMessage({ id: "settings.backup.imported" }));
		} catch (e) {
			devError("Failed to import settings", e);
			toast.error(formatMessage({ id: "settings.backup.error.import" }));
		} finally {
			setBusy(false);
		}
	}, [
		containersPaths,
		recent,
		dispatch,
		formatMessage,
		setTheme,
		setAnimations,
		setAutoUpdate,
	]);

	return { importPath, busy, exportSettings, importSettings } as const;
};
