import { createSelector } from "@reduxjs/toolkit";
import { AppState } from "features/Store";
import { FILTERS_STORE_KEY } from "./Filters.slice";

const selectFiltersSlice = (state: AppState) => state[FILTERS_STORE_KEY];

export const selectFiltersSearchValue = createSelector(
	selectFiltersSlice,
	slice => slice.searchValue,
);

export const selectFiltersFilterType = createSelector(
	selectFiltersSlice,
	slice => slice.filterType,
);

export const selectFiltersState = createSelector(
	selectFiltersSlice,
	slice => slice,
);
