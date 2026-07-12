import { PropsWithChildren, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "features/Store";
import { themeInit } from "features/Theme/state/Theme.actions";
import { selectThemeResolved } from "features/Theme/state/Theme.selectors";

export const ThemeProvider = ({ children }: PropsWithChildren) => {
	const dispatch: AppDispatch = useDispatch();
	const resolved = useSelector(selectThemeResolved);

	useEffect(() => {
		dispatch(themeInit());
	}, [dispatch]);

	useEffect(() => {
		const root = document.documentElement;
		if (resolved === "dark") {
			root.classList.add("dark");
			root.classList.remove("light");
		} else {
			root.classList.add("light");
			root.classList.remove("dark");
		}
	}, [resolved]);

	return children as any;
};
