import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DEFAULT_LOCALE } from "features/Localization/Localization.model";
import { APP_STORE_KEY, AppSlice } from "./App.slice";

const initialState: AppSlice = {
	inited: false,
	loaded: false,
	locale: DEFAULT_LOCALE,
	animations: true,
	autoUpdate: false,
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
		appSetAnimations: (state, { payload }: PayloadAction<boolean>) => {
			state.animations = payload;
		},
		appSetAutoUpdate: (state, { payload }: PayloadAction<boolean>) => {
			state.autoUpdate = payload;
		},
	},
});

export const appReducer = appSlice.reducer;
