import { save } from "@tauri-apps/plugin-dialog";
import { useCallback, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { cn, devError } from "utils";
import { modalSetOpen } from "features/Modal/state/Modal.actions";
import { selectModalPayload } from "features/Modal/state/Modal.selectors";
import { useAppDispatch } from "features/Store";
import { useTheme } from "features/Theme";
import { UIButton, UIImgIcon, UIInput } from "features/UI";
import { useContainerEdit } from "features/Vault/hooks/useContainerEdit";
import { useVault } from "features/Vault/hooks/useVault";
import {
	vaultAddRecentContainer,
	vaultRemoveRecentContainer,
} from "features/Vault/state/Vault.actions";
import {
	selectVaultContainerInfo,
	selectVaultContainers,
	selectVaultResealData,
} from "features/Vault/state/Vault.selectors";
import { icons } from "assets";

const GREEN = "#16853F";

const ModalEditVault = () => {
	const { formatMessage } = useIntl();
	const { resolved } = useTheme();
	const dispatch = useAppDispatch();

	const path = useSelector(selectModalPayload);
	const infoMap = useSelector(selectVaultContainerInfo);
	const containers = useSelector(selectVaultContainers);
	const resealDataList = useSelector(selectVaultResealData);

	const info = infoMap[path];
	const mountDir = containers[path];
	const resealData = resealDataList.find(d => d.containerPath === path);

	const { editData, updateEditData, applyEditToResealData } =
		useContainerEdit(info);

	const { handleCloseContainer, closingProgress } = useVault();

	const [tagInput, setTagInput] = useState("");
	const [vaultPath, setVaultPath] = useState(path);
	const [busy, setBusy] = useState(false);

	/** Metadata lives inside the container, so it can only be rewritten by a reseal. */
	const canSave = !!mountDir && !!resealData;

	const addTag = useCallback(() => {
		const value = tagInput.trim();
		if (!value || editData.tags.includes(value)) {
			setTagInput("");
			return;
		}
		updateEditData("tags", [...editData.tags, value]);
		setTagInput("");
	}, [editData.tags, tagInput, updateEditData]);

	const pickPath = useCallback(async () => {
		const picked = await save({
			defaultPath: vaultPath,
			filters: [{ name: "Vault", extensions: ["tvlt"] }],
		});
		if (picked) setVaultPath(picked);
	}, [vaultPath]);

	const handleSave = useCallback(async () => {
		if (!canSave || !resealData) {
			toast.error(formatMessage({ id: "container.edit.error.locked" }));
			return;
		}
		if (!editData.name.trim()) {
			toast.error(formatMessage({ id: "container.edit.error.name" }));
			return;
		}

		setBusy(true);
		try {
			const moved = vaultPath !== path;
			const updated = applyEditToResealData({
				...resealData,
				newContainerPath: moved ? vaultPath : undefined,
			});

			await handleCloseContainer(path, mountDir ?? "", updated);

			if (moved) {
				await dispatch(vaultRemoveRecentContainer(path));
				await dispatch(vaultAddRecentContainer(vaultPath));
			}

			toast.success(formatMessage({ id: "container.edit.success" }));
			dispatch(modalSetOpen(false));
		} catch (e) {
			devError(e);
			toast.error(formatMessage({ id: "container.edit.error.failed" }));
		} finally {
			setBusy(false);
		}
	}, [
		applyEditToResealData,
		canSave,
		dispatch,
		editData.name,
		formatMessage,
		handleCloseContainer,
		mountDir,
		path,
		resealData,
		vaultPath,
	]);

	const label = (text: string) => (
		<p
			className={cn(
				"text-[14px] font-semibold tracking-[-0.05em] text-fg",
			)}>
			{text}
		</p>
	);

	return (
		<div className="flex flex-col gap-[20px]">
			<div className="flex flex-col gap-[10px]">
				{label(formatMessage({ id: "container.name" }))}
				<UIInput
					value={editData.name}
					onChange={e => updateEditData("name", e.target.value)}
					placeholder={formatMessage({
						id: "common.namePlaceholder",
					})}
				/>
			</div>

			<div className="flex flex-col gap-[10px]">
				{label(formatMessage({ id: "container.comment" }))}
				<UIInput
					value={editData.comment}
					onChange={e => updateEditData("comment", e.target.value)}
					placeholder={formatMessage({
						id: "container.tagsPlaceholder",
					})}
				/>
			</div>

			<div className="flex flex-col gap-[10px]">
				{label(formatMessage({ id: "container.tags" }))}
				<div className="flex items-center gap-[10px]">
					<UIInput
						value={tagInput}
						onChange={e => setTagInput(e.target.value)}
						onKeyDown={e => {
							if (e.key === "Enter") addTag();
						}}
						placeholder={formatMessage({
							id: "modal.create.tags.placeholder",
						})}
					/>
					<UIButton
						icon={icons.plus}
						text={formatMessage({ id: "common.add" })}
						onClick={addTag}
						color="#ffffff"
						noTheme
						center
						style={{
							width: "fit-content",
							backgroundColor: GREEN,
							color: "#ffffff",
						}}
					/>
				</div>
				{editData.tags.length > 0 && (
					<div className="flex flex-wrap items-center gap-[10px]">
						{editData.tags.map(tag => (
							<span
								key={tag}
								onClick={() =>
									updateEditData(
										"tags",
										editData.tags.filter(t => t !== tag),
									)
								}
								className={cn(
									"flex items-center gap-[6px] h-[20px] px-[10px] rounded-[10px] text-[11px] font-bold tracking-[-0.05em] cursor-pointer transition-all duration-200 hover:opacity-70",
									{
										"bg-[#2C4163] text-[#60A5FA]":
											resolved === "dark",
										"bg-[#DCE9FF] text-[#1353A3]":
											resolved === "light",
									},
								)}>
								{tag}
								<UIImgIcon
									icon={icons.close}
									width={8}
									height={8}
									color={
										resolved === "dark"
											? "#60A5FA"
											: "#1353A3"
									}
								/>
							</span>
						))}
					</div>
				)}
			</div>

			<div className="flex flex-col gap-[10px]">
				{label(formatMessage({ id: "container.edit.path" }))}
				<div className="flex items-center gap-[10px]">
					<UIInput
						value={vaultPath}
						readOnly
						style={{ width: 320 }}
					/>
					<UIButton
						icon={icons.eye}
						text={formatMessage({ id: "common.browse" })}
						onClick={pickPath}
						color="#ffffff"
						noTheme
						style={{
							width: "fit-content",
							backgroundColor: GREEN,
							color: "#ffffff",
						}}
					/>
				</div>
			</div>

			{!canSave && (
				<p
					className={cn(
						"text-[14px] font-medium tracking-[-0.05em] text-muted",
					)}>
					{formatMessage({ id: "container.edit.hint.locked" })}
				</p>
			)}

			<UIButton
				icon={icons.save}
				text={
					busy
						? `${closingProgress}%`
						: formatMessage({ id: "common.save" })
				}
				onClick={handleSave}
				disabled={!canSave}
				loading={busy}
				color="#ffffff"
				noTheme
				center
				style={{
					backgroundColor: "var(--accent-blue)",
					color: "#ffffff",
				}}
			/>
		</div>
	);
};

export { ModalEditVault };
