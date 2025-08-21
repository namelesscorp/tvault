import { Fragment } from "react";
import { useSelector } from "react-redux";
import type { ContainerInfoData } from "interfaces";
import { formatLocalDateTime } from "utils";
import { UIButton, UIEditableField } from "features/UI";
import { useContainerEdit } from "features/Vault/hooks";
import { selectVaultResealDataByPath } from "features/Vault/state/Vault.selectors";

export interface DashboardContainerInfoProps {
	path: string;
	mountDir: string;
	isOpened: boolean;
	info?: ContainerInfoData;
	savedMountPath?: string;
	onOpenFolder: () => void;
	onClose: (resealData?: any) => void;
	onOpenClosed: () => void;
	icons: {
		folder: string;
		lock: string;
		pencil?: string;
		check?: string;
		close?: string;
		settings?: string;
	};
}

export const DashboardContainerInfo: React.FC<DashboardContainerInfoProps> = ({
	path,
	mountDir,
	isOpened,
	info,
	savedMountPath,
	onOpenFolder,
	onClose,
	onOpenClosed,
	icons,
}) => {
	const currentResealData = useSelector((state: any) =>
		selectVaultResealDataByPath(state, path),
	);

	const {
		isEditing,
		editData,
		startEdit,
		cancelEdit,
		saveEdit,
		updateEditData,
		applyEditToResealData,
	} = useContainerEdit(info);
	return (
		<div className="flex flex-col gap-[20px] p-[15px] bg-white/5 rounded-[10px] max-h-[645px] overflow-y-auto">
			<div className="flex justify-start gap-[10px]">
				{isOpened ? (
					<Fragment>
						<UIButton
							icon={icons.folder}
							text="Open folder"
							onClick={onOpenFolder}
							style={{ width: "fit-content" }}
						/>
						{isEditing ? (
							<UIButton
								icon={icons.check}
								text="Save"
								onClick={saveEdit}
								style={{ width: "fit-content" }}
							/>
						) : (
							<UIButton
								icon={icons.settings}
								text="Edit"
								onClick={startEdit}
								style={{ width: "fit-content" }}
							/>
						)}
						<UIButton
							icon={icons.lock}
							text="Close"
							onClick={() => {
								// Всегда применяем изменения из editData к resealData, если они есть
								if (currentResealData) {
									const updatedResealData =
										applyEditToResealData(
											currentResealData,
										);
									onClose(updatedResealData);
								} else {
									onClose(currentResealData);
								}
							}}
							style={{ width: "fit-content" }}
						/>
					</Fragment>
				) : (
					<UIButton
						icon={icons.lock}
						text="Open"
						onClick={onOpenClosed}
						style={{ width: "fit-content" }}
					/>
				)}
			</div>

			<div className="mt-[16px] grid grid-cols-2 gap-y-[12px] text-[15px] text-white">
				<p className="opacity-50">Version:</p>
				<p>{info?.version ?? "—"}</p>
				<p className="opacity-50">Path:</p>
				<p className="break-all">{path}</p>
				<p className="opacity-50">Name:</p>
				<UIEditableField
					value={
						isEditing
							? editData.name
							: editData.name || info?.name || ""
					}
					onChange={value => updateEditData("name", value)}
					onSave={saveEdit}
					onCancel={cancelEdit}
					isEditing={isEditing}
					placeholder="Enter name"
				/>
				<p className="opacity-50">Comment:</p>
				<UIEditableField
					value={
						isEditing
							? editData.comment
							: editData.comment || info?.comment || ""
					}
					onChange={value => updateEditData("comment", value)}
					onSave={saveEdit}
					onCancel={cancelEdit}
					isEditing={isEditing}
					placeholder="Enter comment"
				/>
				<p className="opacity-50">Created:</p>
				<p>{formatLocalDateTime(info?.created_at)}</p>
				<p className="opacity-50">Last reseal:</p>
				<p>{formatLocalDateTime(info?.updated_at)}</p>
				<p className="opacity-50">Tags:</p>
				<UIEditableField
					value={
						isEditing
							? editData.tags.join(", ")
							: editData.tags.length > 0
								? editData.tags.join(", ")
								: (info?.tags || [])?.join(", ") || ""
					}
					onChange={value =>
						updateEditData(
							"tags",
							value
								.split(",")
								.map(tag => tag.trim())
								.filter(tag => tag),
						)
					}
					onSave={saveEdit}
					onCancel={cancelEdit}
					isEditing={isEditing}
					placeholder="Enter tags (comma separated)"
				/>
				<p className="opacity-50">Token:</p>
				<p>{info?.token_type ?? "—"}</p>
				<p className="opacity-50">Integrity:</p>
				<p>{info?.integrity_provider_type ?? "—"}</p>
				{info?.integrity_provider_type === "hmac" && (
					<Fragment>
						<p className="opacity-50">Integrity Password:</p>
						<p>••••••••</p>
					</Fragment>
				)}
				<p className="opacity-50">Compression:</p>
				<p>{info?.compression_type ?? "—"}</p>
				<p className="opacity-50">Shares:</p>
				<p>{info?.shares ?? "—"}</p>
				<p className="opacity-50">Threshold:</p>
				<p>{info?.threshold ?? "—"}</p>
				<p className="opacity-50">Mount path:</p>
				<p className="break-all">{mountDir || savedMountPath || "—"}</p>
			</div>
		</div>
	);
};
