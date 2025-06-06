import { devError, devInfo } from "utils";

import { AppDispatch, AppGetState } from "features/Store";

import { appSlice } from "./App.reducer";
import { selectAppInited } from "./App.selectors";

export const { appSetInited, appSetLoaded } = appSlice.actions;

export const appInit =
	() => async (dispatch: AppDispatch, getState: AppGetState) => {
		const appInited = selectAppInited(getState());
		if (appInited) {
			return;
		}

		try {
			devInfo("Loading initial data");
			dispatch(appSetInited(true));
			devInfo("App initialized");
		} catch (e) {
			devError("App initialization error");
			devError(e);
		}
	};
