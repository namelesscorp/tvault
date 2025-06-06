import { combineReducers } from "redux";

import { appReducer } from "features/App/state/App.reducer";
import { APP_STORE_KEY } from "features/App/state/App.slice";

const reducers = {
	[APP_STORE_KEY]: appReducer,
};

export const StoreReducer = combineReducers(reducers);
