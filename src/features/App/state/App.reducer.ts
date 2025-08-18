import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { APP_STORE_KEY, AppSlice } from "./App.slice";

const initialState: AppSlice = {
	inited: false,
	loaded: false,
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
	},
});

export const appReducer = appSlice.reducer;
