import { useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RouteTypes } from "interfaces";
import {
	selectVaultOpenWizardState,
	selectVaultWizardState,
} from "../state/Vault.selectors";

export const useWizardNavigation = () => {
	const navigate = useNavigate();
	const wizardState = useSelector(selectVaultWizardState);
	const openWizardState = useSelector(selectVaultOpenWizardState);

	const navigateToLastCreateStep = useCallback(() => {
		if (
			wizardState.lastStep &&
			wizardState.lastStep !== RouteTypes.VaultCreate
		) {
			navigate(wizardState.lastStep);
		} else {
			navigate(RouteTypes.VaultCreateBasic);
		}
	}, [wizardState.lastStep, navigate]);

	const navigateToLastOpenStep = useCallback(() => {
		if (
			openWizardState.lastStep &&
			openWizardState.lastStep !== RouteTypes.VaultOpen
		) {
			navigate(openWizardState.lastStep);
		} else {
			navigate(RouteTypes.VaultOpenContainer);
		}
	}, [openWizardState.lastStep, navigate]);

	return {
		navigateToLastCreateStep,
		navigateToLastOpenStep,
	};
};
