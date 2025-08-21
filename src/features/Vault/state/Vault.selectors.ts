import { createSelector } from "@reduxjs/toolkit";
import { AppState } from "features/Store";
import { VAULT_STORE_KEY } from "./Vault.slice";

const selectVaultSlice = (state: AppState) => state[VAULT_STORE_KEY];

export const selectVaultContainers = createSelector(
	selectVaultSlice,
	slice => slice.containers,
);

export const selectVaultWizardState = createSelector(
	selectVaultSlice,
	slice => slice.wizardState,
);

export const selectVaultOpenWizardState = createSelector(
	selectVaultSlice,
	slice => slice.openWizardState,
);

export const selectVaultRecent = createSelector(
	selectVaultSlice,
	slice => slice.recent,
);

export const selectVaultContainerInfo = createSelector(
	selectVaultSlice,
	slice => slice.containerInfo,
);

export const selectVaultResealData = createSelector(
	selectVaultSlice,
	slice => slice.resealData,
);

export const selectVaultResealDataByPath = createSelector(
	[selectVaultSlice, (_: AppState, containerPath: string) => containerPath],
	(slice, containerPath) =>
		slice.resealData.find(data => data.containerPath === containerPath),
);
