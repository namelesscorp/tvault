import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";
import { IntlProvider } from "react-intl";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { appInit } from "features/App/state/App.actions";
import {
	selectAppInited,
	selectAppLocale,
} from "features/App/state/App.selectors";
import {
	DEFAULT_LOCALE,
	getLocalizationFiles,
} from "features/Localization/Localization.model";
import { Router } from "features/Router";
import { useAppDispatch } from "features/Store";
import { store } from "features/Store";

const App = () => {
	const dispatch = useAppDispatch();
	const appInited = useSelector(selectAppInited);
	const locale = useSelector(selectAppLocale);

	useEffect(() => {
		(async () => {
			await appInit(dispatch, () => store.getState());
			const diag = await invoke("linux_openers_diag");
			toast.info(JSON.stringify(diag, null, 2));
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
		</IntlProvider>
	);
};

export { App };
