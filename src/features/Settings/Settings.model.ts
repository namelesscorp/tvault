import { LocalizationTypes } from "features/Localization/Localization.model";
import { ThemePreference } from "features/Theme/state/Theme.slice";

export const SETTINGS_FILE_FORMAT = "tvault-settings";
export const SETTINGS_FILE_VERSION = 1;
export const SETTINGS_FILE_NAME = "tvault-settings.json";

/**
 * What an exported settings file holds. Preferences and the places to look for
 * containers — never anything secret: passwords, tokens and shares exist only in
 * memory for the length of an unlock, and this file is written in plain text to
 * wherever the user points it.
 */
export interface SettingsFile {
	format: typeof SETTINGS_FILE_FORMAT;
	version: number;
	app?: string;
	exportedAt?: string;
	theme?: ThemePreference;
	locale?: LocalizationTypes;
	animations?: boolean;
	autoUpdate?: boolean;
	/** Folders scanned for containers on startup. */
	containersPaths?: string[];
	/** The dashboard list. Paths only — the vaults themselves stay where they are. */
	recent?: { path: string; lastOpenedAt: number }[];
}

const isTheme = (value: unknown): value is ThemePreference =>
	value === "system" || value === "light" || value === "dark";

const isLocale = (value: unknown): value is LocalizationTypes =>
	typeof value === "string" &&
	Object.values(LocalizationTypes).includes(value as LocalizationTypes);

const isStringArray = (value: unknown): value is string[] =>
	Array.isArray(value) && value.every(item => typeof item === "string");

type RecentEntry = { path: string; lastOpenedAt: number };

const isRecent = (value: unknown): value is RecentEntry[] =>
	Array.isArray(value) &&
	value.every(
		item =>
			!!item &&
			typeof item === "object" &&
			typeof (item as any).path === "string",
	);

/**
 * Returns the settings a file actually carries, or null if it is not one of ours.
 * Fields that fail their check are dropped rather than failing the whole import —
 * a file written by a newer version may well hold keys this build never heard of.
 */
export const parseSettingsFile = (raw: string): SettingsFile | null => {
	let data: unknown;
	try {
		data = JSON.parse(raw);
	} catch {
		return null;
	}

	if (!data || typeof data !== "object") {
		return null;
	}

	const file = data as Record<string, unknown>;
	if (file.format !== SETTINGS_FILE_FORMAT) {
		return null;
	}

	return {
		format: SETTINGS_FILE_FORMAT,
		version:
			typeof file.version === "number"
				? file.version
				: SETTINGS_FILE_VERSION,
		theme: isTheme(file.theme) ? file.theme : undefined,
		locale: isLocale(file.locale) ? file.locale : undefined,
		animations:
			typeof file.animations === "boolean" ? file.animations : undefined,
		autoUpdate:
			typeof file.autoUpdate === "boolean" ? file.autoUpdate : undefined,
		containersPaths: isStringArray(file.containersPaths)
			? file.containersPaths
			: undefined,
		recent: isRecent(file.recent)
			? file.recent.map(item => ({
					path: item.path,
					lastOpenedAt:
						typeof item.lastOpenedAt === "number"
							? item.lastOpenedAt
							: Date.now(),
				}))
			: undefined,
	};
};
