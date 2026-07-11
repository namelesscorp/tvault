import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useIntl } from "react-intl";
import { ModalTypes } from "features/Modal/Modal.model";
import {
	modalSetIcon,
	modalSetOpen,
	modalSetTitle,
	modalSetType,
} from "features/Modal/state/Modal.actions";
import { useAppDispatch } from "features/Store";
import { useTheme } from "features/Theme";
import { UIButton, UIImgIcon } from "features/UI";
import { icons } from "assets";
import logo from "assets/images/logo.svg";

const appWindow = getCurrentWebviewWindow();

const LayoutHeader = () => {
	const dispatch = useAppDispatch();
	const { formatMessage } = useIntl();
	const { resolved } = useTheme();

	const handleAdd = () => {
		dispatch(modalSetType(ModalTypes.ADD));
		dispatch(modalSetOpen(true));
		dispatch(modalSetTitle(formatMessage({ id: "modal.add" })));
		dispatch(modalSetIcon(icons.folder_shield));
	};

	const handleSettings = () => {
		dispatch(modalSetType(ModalTypes.SETTINGS));
		dispatch(modalSetOpen(true));
	};

	return (
		<div>
			<div
				className="flex items-center justify-end p-[5px]"
				data-tauri-drag-region>
				<UIImgIcon
					icon={icons.minus}
					color={resolved === "dark" ? "#ffffff" : "#000000"}
					width={35}
					height={35}
					style={{ position: "absolute", top: 8, right: 45 }}
					pointer
					onClick={() => appWindow.minimize()}
				/>
				<UIImgIcon
					icon={icons.close}
					color={resolved === "dark" ? "#ffffff" : "#000000"}
					width={35}
					height={35}
					pointer
					onClick={() => appWindow.close()}
				/>
			</div>
			<div className="flex items-center justify-between px-[40px]">
				<div className="flex items-center gap-[20px] pointer-events-none">
					<img src={logo} alt="logo" />
					<div className="flex flex-col gap-[5px]">
						<h1 className="text-[32px] font-extrabold leading-[39px] tracking-[-0.05em] text-primary-fg">
							Trust Vault
						</h1>
						<p className="text-[16px] font-medium leading-[20px] tracking-[-0.05em] text-secondary-fg">
							{formatMessage({ id: "header.subtitle" })}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-[30px]">
					<UIButton
						icon={icons.settings}
						text={formatMessage({ id: "common.settings" })}
						onClick={handleSettings}
					/>
					<UIButton
						icon={icons.folder}
						text={formatMessage({ id: "header.open" })}
						onClick={handleAdd}
					/>
					<UIButton
						icon={icons.plus}
						text={formatMessage({ id: "header.create" })}
						style={{
							background:
								"linear-gradient(90deg, #2C60EA 0%, #9034EA 100%)",
							color: "#ffffff",
						}}
						noTheme
					/>
				</div>
			</div>
		</div>
	);
};

export { LayoutHeader };
