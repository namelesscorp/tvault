import { Fragment } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import type { ContainerInfoData } from "interfaces";
import { formatLocalDateTime } from "utils";
import { UIButton, UIEditableField } from "features/UI";
import { useContainerEdit } from "features/Vault/hooks";
import { selectVaultResealDataByPath } from "features/Vault/state/Vault.selectors";
import { icons } from "assets";

export interface DashboardContainerInfoProps {
	path: string;
	mountDir: string;
	isOpened: boolean;
	info?: ContainerInfoData;
	savedMountPath?: string;
	onOpenFolder: () => void;
	onClose: (resealData?: any) => void;
	onOpenClosed: () => void;
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
}) => {
	const { formatMessage } = useIntl();
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
							text={formatMessage({ id: "container.openFolder" })}
							onClick={onOpenFolder}
							style={{ width: "fit-content" }}
						/>
						{isEditing ? (
							<UIButton
								icon={icons.check}
								text={formatMessage({ id: "common.save" })}
								onClick={saveEdit}
								style={{ width: "fit-content" }}
							/>
						) : (
							<UIButton
								icon={icons.pencil}
								text={formatMessage({ id: "common.edit" })}
								onClick={startEdit}
								style={{ width: "fit-content" }}
							/>
						)}
						<UIButton
							icon={icons.lock}
							text={formatMessage({ id: "common.close" })}
							onClick={() => {
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
						text={formatMessage({ id: "common.open" })}
						onClick={onOpenClosed}
						style={{ width: "fit-content" }}
					/>
				)}
			</div>

			<div className="mt-[16px] grid grid-cols-2 gap-y-[12px] text-[15px] text-white">
				<p className="opacity-50">
					{formatMessage({ id: "container.version" })}:
				</p>
				<p>{info?.version ?? "—"}</p>
				<p className="opacity-50">
					{formatMessage({ id: "container.state" })}:
				</p>
				<p>
					{isOpened
						? formatMessage({ id: "container.opened" })
						: formatMessage({ id: "container.closed" })}
				</p>
				<p className="opacity-50">
					{formatMessage({ id: "container.path" })}:
				</p>
				<p className="break-all">{path}</p>
				<p className="opacity-50">
					{formatMessage({ id: "container.name" })}:
				</p>
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
				<p className="opacity-50">
					{formatMessage({ id: "container.comment" })}:
				</p>
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
				<p className="opacity-50">
					{formatMessage({ id: "container.created" })}:
				</p>
				<p>{formatLocalDateTime(info?.created_at)}</p>
				<p className="opacity-50">
					{formatMessage({ id: "container.lastReseal" })}:
				</p>
				<p>{formatLocalDateTime(info?.updated_at)}</p>
				<p className="opacity-50">
					{formatMessage({ id: "container.tags" })}:
				</p>
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
					placeholder={formatMessage({
						id: "container.tagsPlaceholder",
					})}
				/>
				<p className="opacity-50">
					{formatMessage({ id: "container.token" })}:
				</p>
				<p>{info?.token_type ?? "—"}</p>
				<p className="opacity-50">
					{formatMessage({ id: "container.integrity" })}:
				</p>
				<p>{info?.integrity_provider_type ?? "—"}</p>
				{info?.integrity_provider_type === "hmac" && (
					<Fragment>
						<p className="opacity-50">
							{formatMessage({
								id: "container.integrityPassword",
							})}
							:
						</p>
						<p>••••••••</p>
					</Fragment>
				)}
				<p className="opacity-50">
					{formatMessage({ id: "container.compression" })}:
				</p>
				<p>{info?.compression_type ?? "—"}</p>
				<p className="opacity-50">
					{formatMessage({ id: "container.shares" })}:
				</p>
				{info?.token_type === "share" && (
					<Fragment>
						<p>{info?.shares ?? "—"}</p>
						<p className="opacity-50">
							{formatMessage({ id: "container.threshold" })}:
						</p>
						<p>{info?.threshold ?? "—"}</p>
						<p className="opacity-50">
							{formatMessage({ id: "container.mountPath" })}:
						</p>
					</Fragment>
				)}
				<p className="break-all">{mountDir || savedMountPath || "—"}</p>
			</div>
		</div>
	);
};
