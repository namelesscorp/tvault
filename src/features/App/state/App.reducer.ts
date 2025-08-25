import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DEFAULT_LOCALE } from "features/Localization/Localization.model";
import { APP_STORE_KEY, AppSlice } from "./App.slice";

const initialState: AppSlice = {
	inited: false,
	loaded: false,
	locale: DEFAULT_LOCALE,
};

export const appSlice = createSlice({
	name: APP_STORE_KEY,
	initialState,
	reducers: {
		appSetInited: (state, { payload }: PayloadAction<boolean>) => {
			state.inited = payload;
		},
		appSetLoaded: (state, { payload }: PayloadAction<boolean>) => {
			state.loaded = payload;
		},
		appSetLocale: (
			state,
			{ payload }: PayloadAction<AppSlice["locale"]>,
		) => {
			state.locale = payload;
		},
	},
});

export const appReducer = appSlice.reducer;
