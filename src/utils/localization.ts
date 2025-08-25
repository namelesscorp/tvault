import { Store } from "@tauri-apps/plugin-store";
import {
	DEFAULT_LOCALE,
	LocalizationTypes,
} from "features/Localization/Localization.model";

const LOCALE_STORE_KEY = "locale.json";
const LOCALE_CACHE_KEY = "userLocale";

export const getCachedLocale = async (): Promise<LocalizationTypes> => {
	try {
		const store = await Store.load(LOCALE_STORE_KEY);
		const cachedLocale =
			await store.get<LocalizationTypes>(LOCALE_CACHE_KEY);

		if (
			cachedLocale &&
			Object.values(LocalizationTypes).includes(cachedLocale)
		) {
			return cachedLocale;
		}

		return DEFAULT_LOCALE;
	} catch (error) {
		console.warn("Failed to load cached locale, using default:", error);
		return DEFAULT_LOCALE;
	}
};

export const setCachedLocale = async (
	locale: LocalizationTypes,
): Promise<void> => {
	try {
		const store = await Store.load(LOCALE_STORE_KEY);
		await store.set(LOCALE_CACHE_KEY, locale);
		await store.save();
	} catch (error) {
		console.error("Failed to save locale to cache:", error);
	}
};
