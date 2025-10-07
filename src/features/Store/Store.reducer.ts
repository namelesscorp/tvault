import { combineReducers } from "redux";
import { appReducer } from "features/App/state/App.reducer";
import { APP_STORE_KEY } from "features/App/state/App.slice";
import { filtersReducer } from "features/Filters/state/Filters.reducer";
import { FILTERS_STORE_KEY } from "features/Filters/state/Filters.slice";
import { themeReducer } from "features/Theme/state/Theme.reducer";
import { THEME_STORE_KEY } from "features/Theme/state/Theme.slice";
import { vaultReducer } from "features/Vault/state/Vault.reducer";
import { VAULT_STORE_KEY } from "features/Vault/state/Vault.slice";

const reducers = {
	[APP_STORE_KEY]: appReducer,
	[VAULT_STORE_KEY]: vaultReducer,
	[THEME_STORE_KEY]: themeReducer,
	[FILTERS_STORE_KEY]: filtersReducer,
};

export const StoreReducer = combineReducers(reducers);
