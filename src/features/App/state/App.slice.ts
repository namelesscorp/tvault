import { LocalizationTypes } from "features/Localization/Localization.model";

export const APP_STORE_KEY = "app";

export interface AppSlice {
	inited: boolean;
	loaded: boolean;
	locale: LocalizationTypes;
	/** Settings › Interface › Animations. Drives the `no-motion` class on <html>. */
	animations: boolean;
	/** Settings › Updates. Checks and downloads releases in the background. */
	autoUpdate: boolean;
}
