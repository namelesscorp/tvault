import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { appChangeLocale } from "features/App/state/App.actions";
import { selectAppLocale } from "features/App/state/App.selectors";
import { AppDispatch } from "features/Store";
import { LocalizationTypes } from "../Localization.model";

export const useLocale = () => {
	const dispatch = useDispatch<AppDispatch>();
	const currentLocale = useSelector(selectAppLocale);

	const changeLocale = useCallback(
		(locale: LocalizationTypes) => {
			dispatch(appChangeLocale(locale));
		},
		[dispatch],
	);

	return {
		locale: currentLocale,
		changeLocale,
	};
};
