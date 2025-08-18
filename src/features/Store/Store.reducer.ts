import { combineReducers } from "redux";
import { appReducer } from "features/App/state/App.reducer";
import { APP_STORE_KEY } from "features/App/state/App.slice";
import { vaultReducer } from "features/Vault/state/Vault.reducer";
import { VAULT_STORE_KEY } from "features/Vault/state/Vault.slice";

const reducers = {
	[APP_STORE_KEY]: appReducer,
	[VAULT_STORE_KEY]: vaultReducer,
};

export const StoreReducer = combineReducers(reducers);
