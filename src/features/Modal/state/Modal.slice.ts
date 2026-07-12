import { ModalTypes } from "../Modal.model";

export const MODAL_STORE_KEY = "modal";

export interface ModalSlice {
	modalOpen: boolean;
	modalType: ModalTypes;
	modalTitle: string;
	modalIcon: string;
	/** Container path the modal acts on (edit / info / delete). */
	modalPayload: string;
	/**
	 * Set while the CLI is encrypting/decrypting: closing then would leave the
	 * process running with nothing left to record its result.
	 */
	modalBusy: boolean;
}
