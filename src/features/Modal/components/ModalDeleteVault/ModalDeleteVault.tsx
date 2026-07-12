import { useCallback, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getContainerName } from "features/Dashboard/Dashboard.utils";
import { cn, devError } from "utils";
import { modalSetOpen } from "features/Modal/state/Modal.actions";
import { selectModalPayload } from "features/Modal/state/Modal.selectors";
import { useAppDispatch } from "features/Store";
import { useTheme } from "features/Theme";
import { UIButton, UIImgIcon, UIInput } from "features/UI";
import { vaultDeleteContainer } from "features/Vault/state/Vault.actions";
import {
	selectVaultContainerInfo,
	selectVaultContainers,
} from "features/Vault/state/Vault.selectors";
import { icons } from "assets";

const RED_DARK = "#F87171";
const RED_LIGHT = "#E65757";

const ModalDeleteVault = () => {
	const { formatMessage } = useIntl();
	const { resolved } = useTheme();
	const dispatch = useAppDispatch();

	const path = useSelector(selectModalPayload);
	const infoMap = useSelector(selectVaultContainerInfo);
	const containers = useSelector(selectVaultContainers);

	const name = getContainerName(path, infoMap[path]);
	const isOpened = !!containers[path];

	const [confirmation, setConfirmation] = useState("");
	const [busy, setBusy] = useState(false);

	/** Typing the vault name is the guard against deleting the wrong container. */
	const confirmed = confirmation.trim() === name;
	const red = resolved === "dark" ? RED_DARK : RED_LIGHT;

	const handleDelete = useCallback(async () => {
		setBusy(true);
		try {
			await dispatch(vaultDeleteContainer(path));
			toast.success(formatMessage({ id: "container.delete.success" }));
			dispatch(modalSetOpen(false));
		} catch (e) {
			devError(e);
			toast.error(formatMessage({ id: "container.delete.error" }));
		} finally {
			setBusy(false);
		}
	}, [dispatch, formatMessage, path]);

	return (
		<div className="flex flex-col gap-[20px]">
			<div
				className={cn(
					"flex flex-col gap-[10px] border rounded-[10px] p-[15px]",
					{
						"bg-[#4A2E3F]/40 border-[#F87171]/40":
							resolved === "dark",
						"bg-[#FEDBDA]/60 border-[#E65757]/40":
							resolved === "light",
					},
				)}>
				<div className="flex items-center gap-[10px]">
					<UIImgIcon
						icon={icons.annotation_alert}
						width={29}
						height={29}
						color={red}
					/>
					<p
						className="text-[16px] font-semibold tracking-[-0.05em]"
						style={{ color: red }}>
						{formatMessage({
							id: "container.delete.warning.title",
						})}
					</p>
				</div>
				<ul className="flex flex-col gap-[8px]">
					{[
						"container.delete.warning.1",
						"container.delete.warning.2",
						"container.delete.warning.3",
					].map(key => (
						<li
							key={key}
							className={cn(
								"flex gap-[10px] text-[14px] font-medium tracking-[-0.05em] text-fg",
							)}>
							<span>•</span>
							<span>{formatMessage({ id: key })}</span>
						</li>
					))}
				</ul>
			</div>

			{isOpened && (
				<p
					className={cn(
						"text-[14px] font-medium tracking-[-0.05em] min-w-0 [overflow-wrap:anywhere] text-muted",
					)}>
					{formatMessage({ id: "container.delete.hint.opened" })}
				</p>
			)}

			<div className="flex flex-col gap-[10px]">
				<p
					className={cn(
						"text-[14px] font-semibold tracking-[-0.05em] min-w-0 [overflow-wrap:anywhere] text-fg",
					)}>
					{formatMessage(
						{ id: "container.delete.confirm.label" },
						{ name },
					)}
				</p>
				<UIInput
					value={confirmation}
					onChange={e => setConfirmation(e.target.value)}
					placeholder={name}
				/>
				<p
					className={cn(
						"text-[14px] font-medium tracking-[-0.05em] min-w-0 [overflow-wrap:anywhere] text-muted",
					)}>
					{path}
				</p>
			</div>

			<div className="grid grid-cols-2 gap-[10px]">
				<UIButton
					text={formatMessage({ id: "common.cancel" })}
					onClick={() => dispatch(modalSetOpen(false))}
					center
				/>
				<UIButton
					icon={icons.minus}
					text={formatMessage({ id: "container.menu.delete" })}
					onClick={handleDelete}
					disabled={!confirmed || busy}
					color="#ffffff"
					noTheme
					center
					style={{ backgroundColor: red, color: "#ffffff" }}
				/>
			</div>
		</div>
	);
};

export { ModalDeleteVault };
