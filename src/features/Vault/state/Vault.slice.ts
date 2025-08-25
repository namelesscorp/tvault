import type { ContainerInfoData } from "interfaces";
import {
	ResealData,
	VaultOpenWizardState,
	VaultWizardState,
} from "../Vault.model";

export const VAULT_STORE_KEY = "vault";

export interface VaultSlice {
	wizardState: VaultWizardState;
	openWizardState: VaultOpenWizardState;
	containers: Record<string, string>;
	recent: { path: string; lastOpenedAt: number; lastMountPath?: string }[];
	containerInfo: Record<string, ContainerInfoData>;
	resealData: ResealData[];
	containersPath: string;
}
