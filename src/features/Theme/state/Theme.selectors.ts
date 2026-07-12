import { AppState } from "features/Store";
import { THEME_STORE_KEY, ThemePreference, ThemeResolved } from "./Theme.slice";

export const selectThemeState = (state: AppState) =>
	(state as any)[THEME_STORE_KEY];

export const selectThemePreference = (state: AppState): ThemePreference =>
	selectThemeState(state)?.preference ?? "system";

export const selectThemeResolved = (state: AppState): ThemeResolved =>
	selectThemeState(state)?.resolved ?? "dark";

export const selectThemeInited = (state: AppState): boolean =>
	Boolean(selectThemeState(state)?.inited);
