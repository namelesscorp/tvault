import { vaultSlice } from "./Vault.reducer";

export const {
	vaultSetContainers,
	vaultAddContainer,
	vaultRemoveContainer,
	vaultSetRecent,
	vaultAddRecent,
	vaultAddRecentWithMountPath,
	vaultSetContainerInfo,
	vaultSetContainerInfoMap,
	vaultRemoveRecent,
	vaultSetWizardState,
	vaultResetWizardState,
	vaultSetOpenWizardState,
	vaultResetOpenWizardState,
	vaultUpdateRecentMountPath,
} = vaultSlice.actions;
