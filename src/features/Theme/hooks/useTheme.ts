import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "features/Store";
import {
	themeChangePreference,
	themeSetResolved,
} from "features/Theme/state/Theme.actions";
import {
	selectThemePreference,
	selectThemeResolved,
} from "features/Theme/state/Theme.selectors";
import { ThemePreference } from "features/Theme/state/Theme.slice";

const getSystemTheme = (): "light" | "dark" => {
	if (typeof window === "undefined" || !window.matchMedia) {
		return "dark";
	}
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
};

export const useTheme = () => {
	const dispatch: AppDispatch = useDispatch();
	const preference = useSelector(selectThemePreference);
	const resolved = useSelector(selectThemeResolved);

	useEffect(() => {
		if (preference === "system") {
			dispatch(themeSetResolved(getSystemTheme()));
			return;
		}
		dispatch(themeSetResolved(preference));
	}, [preference, dispatch]);

	useEffect(() => {
		if (preference !== "system") {
			return;
		}
		if (typeof window === "undefined" || !window.matchMedia) {
			return;
		}
		const mql = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = () => {
			dispatch(themeSetResolved(mql.matches ? "dark" : "light"));
		};
		// add listeners (modern and legacy)
		if (typeof mql.addEventListener === "function") {
			mql.addEventListener("change", handleChange);
		} else if (typeof (mql as any).addListener === "function") {
			(mql as any).addListener(handleChange);
		}
		// initial sync in case something changed between effects
		handleChange();
		return () => {
			if (typeof mql.removeEventListener === "function") {
				mql.removeEventListener("change", handleChange);
			} else if (typeof (mql as any).removeListener === "function") {
				(mql as any).removeListener(handleChange);
			}
		};
	}, [preference, dispatch]);

	const setPreference = useCallback(
		(next: ThemePreference) => {
			dispatch(themeChangePreference(next));
		},
		[dispatch],
	);

	return { preference, resolved, setPreference } as const;
};
