import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { icons } from "~/assets/collections/icons";
import { UIImgIcon } from "~/features/UI";

const appWindow = getCurrentWebviewWindow();

const LayoutHeader = () => (
	<div
		className="flex items-center justify-between h-[70px] pl-[25px] pr-[15px] border-b border-white/10"
		data-tauri-drag-region>
		<p className="text-white italic font-extrabold text-[22px] leading-[27px] tracking-[-0.05em] pointer-events-none">
			TRUST VAULT{" "}
			<span className="font-medium text-white/25">(Beta)</span>
		</p>
		<div className="relative">
			<UIImgIcon
				icon={icons.minus}
				color="#ffffff"
				width={35}
				height={35}
				style={{ position: "absolute", top: 8, right: 45 }}
				pointer
				onClick={() => appWindow.minimize()}
			/>
			<UIImgIcon
				icon={icons.close}
				color="#ffffff"
				width={35}
				height={35}
				pointer
				onClick={() => appWindow.close()}
			/>
		</div>
	</div>
);

export { LayoutHeader };
