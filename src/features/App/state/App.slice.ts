import { LocalizationTypes } from "features/Localization/Localization.model";

export const APP_STORE_KEY = "app";

export interface AppSlice {
	inited: boolean;
	loaded: boolean;
	locale: LocalizationTypes;
}
