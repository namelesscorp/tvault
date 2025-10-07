import { FilterType } from "../Filters.model";

export const FILTERS_STORE_KEY = "filters";

export interface FiltersSlice {
	searchValue: string;
	filterType: FilterType;
}
