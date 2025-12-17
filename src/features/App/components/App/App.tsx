import { useEffect } from "react";
import { IntlProvider } from "react-intl";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import { appInit } from "features/App/state/App.actions";
import {
	selectAppInited,
	selectAppLocale,
} from "features/App/state/App.selectors";
import {
	DEFAULT_LOCALE,
	getLocalizationFiles,
} from "features/Localization/Localization.model";
import { Modal } from "features/Modal";
import { Router } from "features/Router";
import { useAppDispatch } from "features/Store";
import { store } from "features/Store";
import { useTheme } from "features/Theme";

const App = () => {
	const dispatch = useAppDispatch();
	const appInited = useSelector(selectAppInited);
	const locale = useSelector(selectAppLocale);
	const { resolved } = useTheme();

	useEffect(() => {
		(async () => {
			await appInit(dispatch, () => store.getState());
		})();
	}, [dispatch]);

	if (!appInited) {
		return;
	}

	return (
		// @ts-ignore
		<IntlProvider
			locale={locale}
			defaultLocale={DEFAULT_LOCALE}
			messages={getLocalizationFiles()[locale]}>
			<Router />
			<Modal />
			<ToastContainer theme={resolved} />
		</IntlProvider>
	);
};

export { App };
