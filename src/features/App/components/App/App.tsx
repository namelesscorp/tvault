import { useEffect } from "react";
import { useSelector } from "react-redux";
import { appInit } from "features/App/state/App.actions";
import { selectAppInited } from "features/App/state/App.selectors";
import { Router } from "features/Router";
import { useAppDispatch } from "features/Store";
import { store } from "features/Store";

const App = () => {
	const dispatch = useAppDispatch();
	const appInited = useSelector(selectAppInited);

	useEffect(() => {
		(async () => {
			await appInit(dispatch, () => store.getState());
		})();
	}, [dispatch]);

	if (!appInited) {
		return;
	}

	return <Router />;
};

export { App };
