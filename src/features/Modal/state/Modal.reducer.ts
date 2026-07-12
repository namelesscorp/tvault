import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ModalTypes } from "../Modal.model";
import { MODAL_STORE_KEY, ModalSlice } from "./Modal.slice";

const initialState: ModalSlice = {
	modalOpen: false,
	modalType: ModalTypes.SELECT,
	modalTitle: "",
	modalIcon: "",
	modalPayload: "",
	modalBusy: false,
};

export const modalSlice = createSlice({
	name: MODAL_STORE_KEY,
	initialState,
	reducers: {
		modalSetOpen: (state, { payload }: PayloadAction<boolean>) => {
			state.modalOpen = payload;
			if (!payload) {
				state.modalBusy = false;
			}
		},
		modalSetType: (state, { payload }: PayloadAction<ModalTypes>) => {
			state.modalType = payload;
		},
		modalSetTitle: (state, { payload }: PayloadAction<string>) => {
			state.modalTitle = payload;
		},
		modalSetIcon: (state, { payload }: PayloadAction<string>) => {
			state.modalIcon = payload;
		},
		modalSetPayload: (state, { payload }: PayloadAction<string>) => {
			state.modalPayload = payload;
		},
		modalSetBusy: (state, { payload }: PayloadAction<boolean>) => {
			state.modalBusy = payload;
		},
	},
});

export const modalReducer = modalSlice.reducer;
