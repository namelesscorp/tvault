import { useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { cn, useMountTransition } from "utils";
import { useAppDispatch } from "features/Store";
import { UIImgIcon, UIOverlay } from "features/UI";
import { icons } from "assets/collections/icons";
import { ModalTypes } from "../../Modal.model";
import { modalSetOpen } from "../../state/Modal.actions";
import {
	selectModalBusy,
	selectModalIcon,
	selectModalOpen,
	selectModalTitle,
	selectModalType,
} from "../../state/Modal.selectors";
import { ModalAdd } from "../ModalAdd";
import { ModalCreate } from "../ModalCreate";
import { ModalDeleteVault } from "../ModalDeleteVault";
import { ModalEditVault } from "../ModalEditVault";
import { ModalOpen } from "../ModalOpen";
import { ModalSettings } from "../ModalSettings";
import { ModalVaultInfo } from "../ModalVaultInfo";

const Modal = () => {
	const dispatch = useAppDispatch();
	const modalOpen = useSelector(selectModalOpen);
	const modalIcon = useSelector(selectModalIcon);
	const modalTitle = useSelector(selectModalTitle);
	const modalType = useSelector(selectModalType);
	const modalBusy = useSelector(selectModalBusy);

	const { mounted, visible } = useMountTransition(modalOpen);

	/** Closing mid-run would orphan the CLI process, so hold the modal open. */
	const close = useCallback(() => {
		if (modalBusy) return;
		dispatch(modalSetOpen(false));
	}, [dispatch, modalBusy]);

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") close();
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [close]);

	if (!mounted) {
		return null;
	}

	if (modalType === ModalTypes.SETTINGS) {
		return <ModalSettings visible={visible} onClose={close} />;
	}

	return (
		<UIOverlay visible={visible} onClose={close}>
			<div
				className={cn(
					"w-[500px] max-h-[90vh] rounded-[10px] flex flex-col transition-all duration-200 ease-out origin-center bg-panel",
					{
						"opacity-100 scale-100 translate-y-0": visible,
						"opacity-0 scale-95 translate-y-[10px]": !visible,
					},
				)}>
				<div className="flex items-center justify-between px-[15px] pt-[20px] pb-[22px]">
					<div className="flex items-center gap-[10px]">
						<div
							className={cn(
								"flex items-center justify-center w-[50px] h-[50px] rounded-[10px] bg-badge",
							)}>
							<UIImgIcon
								icon={modalIcon}
								width={30}
								height={30}
								color={"var(--accent)"}
							/>
						</div>
						<p
							className={cn(
								"text-[24px] font-bold tracking-[-0.05em] text-fg",
							)}>
							{modalTitle}
						</p>
					</div>
					<div
						className={cn(
							"p-[10px] transition-all duration-200",
							modalBusy
								? "opacity-40 cursor-default"
								: "cursor-pointer hover:opacity-70",
						)}
						onClick={close}>
						<UIImgIcon
							icon={icons.close}
							width={25}
							height={25}
							color={"var(--fg-strong)"}
						/>
					</div>
				</div>
				<div className="px-[15px] pb-[20px] overflow-y-auto">
					{modalType === ModalTypes.OPEN && <ModalOpen />}
					{modalType === ModalTypes.ADD && <ModalAdd />}
					{modalType === ModalTypes.CREATE && <ModalCreate />}
					{modalType === ModalTypes.EDIT && <ModalEditVault />}
					{modalType === ModalTypes.INFO && <ModalVaultInfo />}
					{modalType === ModalTypes.DELETE && <ModalDeleteVault />}
				</div>
			</div>
		</UIOverlay>
	);
};

export { Modal };
