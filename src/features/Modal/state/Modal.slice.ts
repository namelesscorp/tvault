import { ModalTypes } from "../Modal.model";

export const MODAL_STORE_KEY = "modal";

export interface ModalSlice {
	modalOpen: boolean;
	modalType: ModalTypes;
	modalTitle: string;
	modalIcon: string;
}
