import { Store } from "@tauri-apps/plugin-store";

const UPDATES_STORE_KEY = "updates.json";
const AUTO_UPDATE_CACHE_KEY = "auto";

/** Off until the user asks for it: nothing reaches the network on its own. */
export const getCachedAutoUpdate = async (): Promise<boolean> => {
	try {
		const store = await Store.load(UPDATES_STORE_KEY);
		const cached = await store.get<boolean>(AUTO_UPDATE_CACHE_KEY);
		return typeof cached === "boolean" ? cached : false;
	} catch (e) {
		return false;
	}
};

export const setCachedAutoUpdate = async (enabled: boolean): Promise<void> => {
	try {
		const store = await Store.load(UPDATES_STORE_KEY);
		await store.set(AUTO_UPDATE_CACHE_KEY, enabled);
		await store.save();
	} catch (e) {
		// noop
	}
};
