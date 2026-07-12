import { modalSlice } from "./Modal.reducer";

export const {
	modalSetOpen,
	modalSetTitle,
	modalSetIcon,
	modalSetType,
	modalSetPayload,
	modalSetBusy,
} = modalSlice.actions;
