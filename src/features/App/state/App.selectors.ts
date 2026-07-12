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

export const selectAppLocale = createSelector(
	selectAppSlice,
	slice => slice.locale,
);

export const selectAppAnimations = createSelector(
	selectAppSlice,
	slice => slice.animations,
);

export const selectAppAutoUpdate = createSelector(
	selectAppSlice,
	slice => slice.autoUpdate,
);
