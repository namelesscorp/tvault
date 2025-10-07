import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { FilterType } from "../Filters.model";
import { FILTERS_STORE_KEY, FiltersSlice } from "./Filters.slice";

const initialState: FiltersSlice = {
	searchValue: "",
	filterType: "all",
};

export const filtersSlice = createSlice({
	name: FILTERS_STORE_KEY,
	initialState,
	reducers: {
		filtersSetSearchValue: (state, { payload }: PayloadAction<string>) => {
			state.searchValue = payload;
		},
		filtersSetFilterType: (
			state,
			{ payload }: PayloadAction<FilterType>,
		) => {
			state.filterType = payload;
		},
		filtersClear: state => {
			state.searchValue = "";
			state.filterType = "all";
		},
	},
});

export const filtersReducer = filtersSlice.reducer;
