import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { devInfo } from "utils";
import {
	THEME_STORE_KEY,
	ThemePreference,
	ThemeResolved,
	ThemeSlice,
} from "./Theme.slice";

const initialState: ThemeSlice = {
	preference: "system",
	resolved: "dark",
	inited: false,
};

export const themeSlice = createSlice({
	name: THEME_STORE_KEY,
	initialState,
	reducers: {
		themeSetPreference: (
			state,
			{ payload }: PayloadAction<ThemePreference>,
		) => {
			state.preference = payload;
			devInfo("Theme preference set:", payload);
		},
		themeSetResolved: (
			state,
			{ payload }: PayloadAction<ThemeResolved>,
		) => {
			state.resolved = payload;
		},
		themeSetInited: (state, { payload }: PayloadAction<boolean>) => {
			state.inited = payload;
		},
	},
});

export const themeReducer = themeSlice.reducer;
