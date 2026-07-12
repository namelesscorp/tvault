import { useEffect } from "react";
import { IntlProvider } from "react-intl";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import { appInit } from "features/App/state/App.actions";
import {
	selectAppAnimations,
	selectAppInited,
	selectAppLocale,
} from "features/App/state/App.selectors";
import {
	DEFAULT_LOCALE,
	getLocalizationFiles,
} from "features/Localization/Localization.model";
import { Modal } from "features/Modal";
import { Router } from "features/Router";
import { useBackgroundUpdater } from "features/Settings/hooks";
import { useAppDispatch } from "features/Store";
import { store } from "features/Store";
import { useTheme } from "features/Theme";

/** Renders nothing; it only needs to sit inside IntlProvider to word its prompt. */
const BackgroundUpdater = () => {
	useBackgroundUpdater();
	return null;
};

const App = () => {
	const dispatch = useAppDispatch();
	const appInited = useSelector(selectAppInited);
	const locale = useSelector(selectAppLocale);
	const animations = useSelector(selectAppAnimations);
	const { resolved } = useTheme();

	useEffect(() => {
		(async () => {
			await appInit(dispatch, () => store.getState());
		})();
	}, [dispatch]);

	/** One class, and every transition and keyframe in the app stops — see index.css. */
	useEffect(() => {
		document.documentElement.classList.toggle("no-motion", !animations);
	}, [animations]);

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
			<BackgroundUpdater />
			<ToastContainer theme={resolved} />
		</IntlProvider>
	);
};

export { App };
