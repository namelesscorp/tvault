import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ModalTypes } from "../Modal.model";
import { MODAL_STORE_KEY, ModalSlice } from "./Modal.slice";

const initialState: ModalSlice = {
	modalOpen: false,
	modalType: ModalTypes.SELECT,
	modalTitle: "",
	modalIcon: "",
};

export const modalSlice = createSlice({
	name: MODAL_STORE_KEY,
	initialState,
	reducers: {
		modalSetOpen: (state, { payload }: PayloadAction<boolean>) => {
			state.modalOpen = payload;
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
	},
});

export const modalReducer = modalSlice.reducer;
