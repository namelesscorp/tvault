import { Store } from "@tauri-apps/plugin-store";
import { ThemePreference } from "features/Theme/state/Theme.slice";

const THEME_STORE_KEY = "theme.json";
const THEME_CACHE_KEY = "preference";

export const getCachedThemePreference = async (): Promise<ThemePreference> => {
	try {
		const store = await Store.load(THEME_STORE_KEY);
		const pref = await store.get<ThemePreference>(THEME_CACHE_KEY);
		if (pref === "light" || pref === "dark" || pref === "system") {
			return pref;
		}
		return "system";
	} catch (e) {
		return "system";
	}
};

export const setCachedThemePreference = async (
	preference: ThemePreference,
): Promise<void> => {
	try {
		const store = await Store.load(THEME_STORE_KEY);
		await store.set(THEME_CACHE_KEY, preference);
		await store.save();
	} catch (e) {
		// noop
	}
};
