import { createSelector } from "@reduxjs/toolkit";
import { AppState } from "features/Store";
import { APP_STORE_KEY } from "./App.slice";

const selectAppSlice = (state: AppState) => state[APP_STORE_KEY];

export const selectAppInited = createSelector(
	selectAppSlice,
	slice => slice.inited,
);

export const selectAppLoaded = createSelector(
	selectAppSlice,
	slice => slice.loaded,
);
