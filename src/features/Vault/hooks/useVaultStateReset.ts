import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { RouteTypes } from "interfaces";
import {
	vaultResetOpenWizardState,
	vaultResetWizardState,
} from "../state/Vault.actions";

export const useVaultStateReset = () => {
	const location = useLocation();
	const dispatch = useDispatch();

	useEffect(() => {
		const pathname = location.pathname;

		if (pathname === RouteTypes.Dashboard) {
			dispatch(vaultResetWizardState());
			dispatch(vaultResetOpenWizardState());
			return;
		}

		if (pathname.startsWith("/create")) {
			dispatch(vaultResetOpenWizardState());
			return;
		}

		if (pathname.startsWith("/open")) {
			dispatch(vaultResetWizardState());
			return;
		}

		if (pathname.startsWith("/container")) {
			dispatch(vaultResetWizardState());
			dispatch(vaultResetOpenWizardState());
			return;
		}
	}, [location.pathname, dispatch]);
};
