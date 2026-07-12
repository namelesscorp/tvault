import { Store } from "@tauri-apps/plugin-store";

const MOTION_STORE_KEY = "motion.json";
const MOTION_CACHE_KEY = "animations";

/** Animations are on unless the user turned them off (or the OS asks otherwise). */
const getSystemPreference = (): boolean => {
	if (typeof window === "undefined" || !window.matchMedia) {
		return true;
	}
	return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export const getCachedAnimations = async (): Promise<boolean> => {
	try {
		const store = await Store.load(MOTION_STORE_KEY);
		const cached = await store.get<boolean>(MOTION_CACHE_KEY);
		if (typeof cached === "boolean") {
			return cached;
		}
		return getSystemPreference();
	} catch (e) {
		return getSystemPreference();
	}
};

export const setCachedAnimations = async (enabled: boolean): Promise<void> => {
	try {
		const store = await Store.load(MOTION_STORE_KEY);
		await store.set(MOTION_CACHE_KEY, enabled);
		await store.save();
	} catch (e) {
		// noop
	}
};
