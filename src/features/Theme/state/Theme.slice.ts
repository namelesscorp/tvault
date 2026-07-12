export const THEME_STORE_KEY = "theme";

export type ThemePreference = "system" | "light" | "dark";
export type ThemeResolved = "light" | "dark";

export interface ThemeSlice {
	preference: ThemePreference;
	resolved: ThemeResolved;
	inited: boolean;
}
