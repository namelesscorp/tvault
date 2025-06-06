import { configureStore } from "@reduxjs/toolkit";

import { StoreReducer } from "./Store.reducer";

const isProduction = MODE === "production";

export const store = configureStore({
	reducer: StoreReducer,
	devTools: !isProduction,
});

export type Store = typeof store;
export type AppState = ReturnType<Store["getState"]>;
export type AppDispatch = Store["dispatch"];
export type AppGetState = Store["getState"];
