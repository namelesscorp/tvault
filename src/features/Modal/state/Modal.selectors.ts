import { AppState } from "features/Store";
import { ModalTypes } from "../Modal.model";
import { MODAL_STORE_KEY } from "./Modal.slice";

export const selectModalState = (state: AppState) =>
	(state as any)[MODAL_STORE_KEY];

export const selectModalOpen = (state: AppState): boolean =>
	selectModalState(state)?.modalOpen ?? false;

export const selectModalType = (state: AppState): ModalTypes =>
	selectModalState(state)?.modalType ?? ModalTypes.SELECT;

export const selectModalTitle = (state: AppState): string =>
	selectModalState(state)?.modalTitle ?? "";

export const selectModalIcon = (state: AppState): string =>
	selectModalState(state)?.modalIcon ?? "";

export const selectModalPayload = (state: AppState): string =>
	selectModalState(state)?.modalPayload ?? "";

export const selectModalBusy = (state: AppState): boolean =>
	selectModalState(state)?.modalBusy ?? false;
