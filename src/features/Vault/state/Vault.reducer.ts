import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { ContainerInfoData } from "interfaces";
import {
	SHAMIR_DEFAULT_THRESHOLD,
	SHAMIR_DEFAULT_TOTAL,
	VaultOpenWizardState,
	VaultWizardState,
} from "../Vault.model";
import { VAULT_STORE_KEY, VaultSlice } from "./Vault.slice";

const initialState: VaultSlice = {
	wizardState: {
		name: "",
		inputPath: "",
		outputPath: "",
		comment: "",
		tags: "",
		keySource: "generated",
		split: true,
		k: SHAMIR_DEFAULT_THRESHOLD,
		n: SHAMIR_DEFAULT_TOTAL,
		shareEncoding: "base64",
		tokenType: "share",
		compression: "zip",
		shareDest: "file",
		sharePath: "",
		integrityProvider: "none",
		additionalPassword: "",
	},
	openWizardState: {
		containerPath: "",
		mountDir: "",
		autoMountDir: true,
		customMountDir: "",
		tokenType: "none",
		integrityProvider: "none",
		method: "password",
	},
	containers: {},
	recent: [],
	containerInfo: {},
};

export const vaultSlice = createSlice({
	name: VAULT_STORE_KEY,
	initialState,
	reducers: {
		vaultSetContainers: (
			state,
			{ payload }: PayloadAction<Record<string, string>>,
		) => {
			state.containers = payload;
		},
		vaultAddContainer: (
			state,
			{
				payload,
			}: PayloadAction<{ containerPath: string; mountDir: string }>,
		) => {
			state.containers[payload.containerPath] = payload.mountDir;
		},
		vaultRemoveContainer: (state, { payload }: PayloadAction<string>) => {
			delete state.containers[payload];
		},
		vaultSetRecent: (
			state,
			{
				payload,
			}: PayloadAction<
				{ path: string; lastOpenedAt: number; lastMountPath?: string }[]
			>,
		) => {
			state.recent = payload;
		},
		vaultAddRecent: (state, { payload }: PayloadAction<string>) => {
			const filtered = state.recent.filter(r => r.path !== payload);
			filtered.unshift({ path: payload, lastOpenedAt: Date.now() });
			state.recent = filtered.slice(0, 100);
		},
		vaultAddRecentWithMountPath: (
			state,
			{ payload }: PayloadAction<{ path: string; mountPath?: string }>,
		) => {
			const filtered = state.recent.filter(r => r.path !== payload.path);
			filtered.unshift({
				path: payload.path,
				lastOpenedAt: Date.now(),
				lastMountPath: payload.mountPath,
			});
			state.recent = filtered.slice(0, 100);
		},
		vaultUpdateRecentMountPath: (
			state,
			{ payload }: PayloadAction<{ path: string; mountPath: string }>,
		) => {
			const recentItem = state.recent.find(r => r.path === payload.path);
			if (recentItem) {
				recentItem.lastMountPath = payload.mountPath;
			}
		},
		vaultSetContainerInfo: (
			state,
			{
				payload,
			}: PayloadAction<{
				path: string;
				info: VaultSlice["containerInfo"][string];
			}>,
		) => {
			state.containerInfo[payload.path] = payload.info;
		},
		vaultSetContainerInfoMap: (
			state,
			{ payload }: PayloadAction<Record<string, ContainerInfoData>>,
		) => {
			state.containerInfo = payload || {};
		},
		vaultRemoveRecent: (state, { payload }: PayloadAction<string>) => {
			state.recent = state.recent.filter(r => r.path !== payload);
			delete state.containerInfo[payload];
		},
		vaultSetWizardState: (
			state,
			{ payload }: PayloadAction<VaultWizardState>,
		) => {
			state.wizardState = payload;
		},
		vaultResetWizardState: state => {
			state.wizardState = initialState.wizardState;
		},
		vaultSetOpenWizardState: (
			state,
			{ payload }: PayloadAction<VaultOpenWizardState>,
		) => {
			state.openWizardState = payload;
		},
		vaultResetOpenWizardState: state => {
			state.openWizardState = initialState.openWizardState;
		},
	},
});

export const vaultReducer = vaultSlice.reducer;
