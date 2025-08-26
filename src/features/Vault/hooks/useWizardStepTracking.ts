import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { RouteTypes } from "interfaces";
import { useAppDispatch } from "features/Store";
import {
	vaultUpdateOpenWizardLastStep,
	vaultUpdateWizardLastStep,
} from "../state/Vault.actions";

export const useWizardStepTracking = () => {
	const location = useLocation();
	const dispatch = useAppDispatch();

	useEffect(() => {
		const pathname = location.pathname;

		if (
			pathname.startsWith("/create") &&
			pathname !== RouteTypes.VaultCreate
		) {
			const createRoute = Object.values(RouteTypes).find(
				route => route === pathname,
			);
			if (createRoute) {
				dispatch(vaultUpdateWizardLastStep(createRoute));
			}
		}

		if (pathname.startsWith("/open") && pathname !== RouteTypes.VaultOpen) {
			const openRoute = Object.values(RouteTypes).find(
				route => route === pathname,
			);
			if (openRoute) {
				dispatch(vaultUpdateOpenWizardLastStep(openRoute));
			}
		}
	}, [location.pathname, dispatch]);
};
