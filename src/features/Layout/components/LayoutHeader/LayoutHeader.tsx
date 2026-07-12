import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { devError } from "utils";
import { ModalTypes } from "features/Modal/Modal.model";
import {
	modalSetIcon,
	modalSetOpen,
	modalSetTitle,
	modalSetType,
} from "features/Modal/state/Modal.actions";
import { useAppDispatch } from "features/Store";
import { UIButton, UIImgIcon } from "features/UI";
import { icons } from "assets";
import logo from "assets/images/logo.svg";

const appWindow = getCurrentWebviewWindow();

const LayoutHeader = () => {
	const dispatch = useAppDispatch();
	const { formatMessage } = useIntl();

	/**
	 * macOS keeps the native frame (see tauri.macos.conf.json) and draws its own
	 * traffic lights over the header. Ask the window instead of guessing by
	 * platform: if the frame is missing for any reason, we still paint controls.
	 */
	const [nativeControls, setNativeControls] = useState(false);

	useEffect(() => {
		appWindow
			.isDecorated()
			.then(decorated => {
				setNativeControls(decorated);
				/** The OS rounds a decorated window itself — ours would show through. */
				document.documentElement.classList.toggle(
					"native-frame",
					decorated,
				);
			})
			.catch(e => devError("Failed to read window decorations", e));
	}, []);

	const handleAdd = () => {
		dispatch(modalSetType(ModalTypes.ADD));
		dispatch(modalSetOpen(true));
		dispatch(modalSetTitle(formatMessage({ id: "modal.add" })));
		dispatch(modalSetIcon(icons.folder_shield));
	};

	const handleCreate = () => {
		dispatch(modalSetType(ModalTypes.CREATE));
		dispatch(modalSetOpen(true));
		dispatch(modalSetTitle(formatMessage({ id: "modal.create" })));
		dispatch(modalSetIcon(icons.folder_plus));
	};

	const handleSettings = () => {
		dispatch(modalSetType(ModalTypes.SETTINGS));
		dispatch(modalSetOpen(true));
	};

	return (
		<div>
			{nativeControls ? (
				<div className="h-[45px]" data-tauri-drag-region />
			) : (
				<div
					className="flex items-center justify-end p-[5px]"
					data-tauri-drag-region>
					<UIImgIcon
						icon={icons.minus}
						color={"var(--fg-strong)"}
						width={35}
						height={35}
						style={{ position: "absolute", top: 8, right: 45 }}
						pointer
						onClick={() => appWindow.minimize()}
					/>
					<UIImgIcon
						icon={icons.close}
						color={"var(--fg-strong)"}
						width={35}
						height={35}
						pointer
						onClick={() => appWindow.close()}
					/>
				</div>
			)}
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
				<div className="flex items-center gap-[15px]">
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
						onClick={handleCreate}
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
