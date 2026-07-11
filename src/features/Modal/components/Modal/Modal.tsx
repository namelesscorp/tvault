import { useSelector } from "react-redux";
import { cn } from "utils";
import { useAppDispatch } from "features/Store";
import { useTheme } from "features/Theme";
import { UIImgIcon } from "features/UI";
import { icons } from "assets/collections/icons";
import { ModalTypes } from "../../Modal.model";
import { modalSetOpen } from "../../state/Modal.actions";
import {
	selectModalIcon,
	selectModalOpen,
	selectModalTitle,
	selectModalType,
} from "../../state/Modal.selectors";
import { ModalAdd } from "../ModalAdd";
import { ModalOpen } from "../ModalOpen";
import { ModalSettings } from "../ModalSettings";

const Modal = () => {
	const dispatch = useAppDispatch();
	const modalOpen = useSelector(selectModalOpen);
	const modalIcon = useSelector(selectModalIcon);
	const modalTitle = useSelector(selectModalTitle);
	const modalType = useSelector(selectModalType);

	const { resolved } = useTheme();

	if (!modalOpen) {
		return null;
	}

	if (modalType === ModalTypes.SETTINGS) {
		return <ModalSettings />;
	}

	return (
		<div className="fixed top-0 left-0 w-full h-full flex items-center justify-center backdrop-blur-sm rounded-[10px]">
			<div
				className={cn(
					"w-[500px] max-h-[90vh] rounded-[10px] flex flex-col",
					{
						"bg-[#1E293B]": resolved === "dark",
						"bg-[#F5F7FF]": resolved === "light",
					},
				)}>
				<div className="flex items-center justify-between px-[15px] pt-[20px] pb-[22px]">
					<div className="flex items-center gap-[10px]">
						<div
							className={cn(
								"flex items-center justify-center w-[50px] h-[50px] rounded-[10px]",
								{
									"bg-[#20314D]": resolved === "dark",
									"bg-[#9AC7FF]": resolved === "light",
								},
							)}>
							<UIImgIcon
								icon={modalIcon}
								width={30}
								height={30}
								color={
									resolved === "dark" ? "#538DD5" : "#1353A3"
								}
							/>
						</div>
						<p
							className={cn(
								"text-[24px] font-bold tracking-[-0.05em]",
								{
									"text-white": resolved === "dark",
									"text-black/80": resolved === "light",
								},
							)}>
							{modalTitle}
						</p>
					</div>
					<div
						className="p-[10px] cursor-pointer"
						onClick={() => dispatch(modalSetOpen(false))}>
						<UIImgIcon
							icon={icons.close}
							width={16}
							height={16}
							color={resolved === "dark" ? "#ffffff" : "#000000"}
						/>
					</div>
				</div>
				<div className="px-[15px] pb-[20px] overflow-y-auto">
					{modalType === ModalTypes.OPEN && <ModalOpen />}
					{modalType === ModalTypes.ADD && <ModalAdd />}
				</div>
			</div>
		</div>
	);
};

export { Modal };
