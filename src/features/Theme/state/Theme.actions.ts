import { devError, devInfo } from "utils";
import { getCachedThemePreference, setCachedThemePreference } from "utils";
import { AppDispatch } from "features/Store";
import { themeSlice } from "./Theme.reducer";
import { ThemePreference } from "./Theme.slice";

export const { themeSetPreference, themeSetResolved, themeSetInited } =
	themeSlice.actions;

export const themeInit = () => {
	return async (dispatch: AppDispatch) => {
		try {
			const cached = await getCachedThemePreference();
			dispatch(themeSetPreference(cached));
			devInfo("Loaded cached theme preference:", cached);
		} catch (e) {
			devError("Failed to load cached theme preference", e);
		}
		dispatch(themeSetInited(true));
	};
};

export const themeChangePreference = (preference: ThemePreference) => {
	return async (dispatch: AppDispatch) => {
		dispatch(themeSetPreference(preference));
		try {
			await setCachedThemePreference(preference);
			devInfo("Theme preference saved:", preference);
		} catch (e) {
			devError("Failed to save theme preference", e);
		}
	};
};
