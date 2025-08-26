import { Fragment, useMemo } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { RouteTypes } from "interfaces";
import { formatLocalDateTime, useRequestGuard } from "utils";
import {
	UIButton,
	UIContainerRow,
	UIEditableField,
	UIImgIcon,
} from "features/UI";
import { icons } from "assets";
import { useContainerEdit, useContainerInfo, useVault } from "../../hooks";
import {
	selectVaultContainers,
	selectVaultRecent,
	selectVaultResealDataByPath,
} from "../../state/Vault.selectors";

function decodeId(id: string): string | null {
	try {
		return atob(id);
	} catch {
		return null;
	}
}

const ContainerDetails = () => {
	const { formatMessage } = useIntl();
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const containers = useSelector(selectVaultContainers);
	const recent = useSelector(selectVaultRecent);
	const {
		handleOpenFolder,
		handleCloseContainer,
		handleOpenClosedContainer,
	} = useVault(() => {
		navigate(RouteTypes.Dashboard);
	});

	const containerPath = useMemo(() => {
		if (!id) return null;
		return decodeId(id);
	}, [id]);

	const mountDir = containerPath ? containers[containerPath] : undefined;
	const isOpened = !!mountDir;
	const { run, result } = useContainerInfo();

	const {
		isEditing,
		editData,
		startEdit,
		cancelEdit,
		saveEdit,
		updateEditData,
		applyEditToResealData,
	} = useContainerEdit(result?.data);

	const { fn: guardedRun } = useRequestGuard(run);

	useMemo(() => {
		if (containerPath) {
			guardedRun(containerPath).catch(() => {});
		}
	}, [containerPath, guardedRun]);

	if (!containerPath) {
		toast.error("Invalid container identifier");
		return null;
	}

	const currentResealData = useSelector((state: any) =>
		selectVaultResealDataByPath(state, containerPath || ""),
	);
	const recentItem = recent.find(r => r.path === containerPath);
	const containerName = result?.data?.name || containerPath;

	const handleBack = () => {
		navigate(RouteTypes.Dashboard);
	};

	const handleReseal = () => {
		if (!containerPath) return;

		if (currentResealData) {
			const updatedResealData = applyEditToResealData(currentResealData);
			handleCloseContainer(
				containerPath,
				mountDir || "",
				updatedResealData,
			);
		} else {
			handleCloseContainer(
				containerPath,
				mountDir || "",
				currentResealData,
			);
		}
	};

	return (
		<section className="flex flex-col gap-[20px]">
			<div className="flex items-center gap-[20px]">
				<UIImgIcon icon={icons.folder} width={30} height={30} />
				<p className="text-[20px] text-white text-medium">
					{formatMessage({ id: "container.container" })}
				</p>
			</div>
			<UIContainerRow
				text={containerName}
				active
				onClick={() => {}}
				onDoubleClick={handleBack}
			/>

			{!!result?.data && (
				<div className="p-[15px] bg-white/5 rounded-[10px] max-h-[500px] overflow-y-auto">
					<div className="grid grid-cols-2 gap-y-[10px] text-[15px] text-white">
						<p className="opacity-50">
							{formatMessage({ id: "container.path" })}:
						</p>
						<p>{containerPath}</p>
						{isOpened && (
							<Fragment>
								<p className="opacity-50">
									{formatMessage({
										id: "container.mountPath",
									})}
									:
								</p>
								<p className="break-all">{mountDir}</p>
							</Fragment>
						)}
						<p className="opacity-50">
							{formatMessage({ id: "container.state" })}:
						</p>
						<p>
							{isOpened
								? formatMessage({ id: "container.opened" })
								: formatMessage({ id: "container.closed" })}
						</p>
						<p className="opacity-50">
							{formatMessage({ id: "container.version" })}:
						</p>
						<p>{result.data?.version ?? "—"}</p>
						<p className="opacity-50">
							{formatMessage({ id: "container.name" })}:
						</p>
						<UIEditableField
							value={
								isEditing
									? editData.name
									: editData.name || result.data?.name || ""
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
									: editData.comment ||
										result.data?.comment ||
										""
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
						<p>{formatLocalDateTime(result.data?.created_at)}</p>
						<p className="opacity-50">
							{formatMessage({ id: "container.lastReseal" })}:
						</p>
						<p>{formatLocalDateTime(result.data?.updated_at)}</p>
						<p className="opacity-50">
							{formatMessage({ id: "container.lastSeen" })}:
						</p>
						<p>
							{formatLocalDateTime(
								new Date(
									recentItem?.lastOpenedAt ?? "",
								).toISOString(),
							)}
						</p>
						<p className="opacity-50">
							{formatMessage({ id: "container.tags" })}:
						</p>
						<UIEditableField
							value={
								isEditing
									? editData.tags.join(", ")
									: editData.tags.length > 0
										? editData.tags.join(", ")
										: (result.data?.tags as string[])?.join(
												", ",
											) || ""
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
						<p>{result.data?.token_type ?? "—"}</p>
						<p className="opacity-50">
							{formatMessage({ id: "container.integrity" })}:
						</p>
						<p>{result.data?.integrity_provider_type ?? "—"}</p>
						{result.data?.integrity_provider_type === "hmac" && (
							<Fragment>
								<p className="opacity-50">
									{formatMessage({
										id: "container.integrityPassword",
									})}
								</p>
								<p>••••••••</p>
							</Fragment>
						)}
						<p className="opacity-50">
							{formatMessage({ id: "container.compression" })}:
						</p>
						<p>{result.data?.compression_type ?? "—"}</p>
						{result.data?.token_type === "share" && (
							<Fragment>
								<p className="opacity-50">
									{formatMessage({ id: "container.shares" })}:
								</p>
								<p>{result.data?.shares ?? "—"}</p>
								<p className="opacity-50">
									{formatMessage({
										id: "container.threshold",
									})}
									:
								</p>
								<p>{result.data?.threshold ?? "—"}</p>
							</Fragment>
						)}
					</div>
				</div>
			)}
			<div className="flex justify-start gap-[10px]">
				<UIButton
					icon={icons.back}
					text={formatMessage({ id: "common.back" })}
					onClick={handleBack}
					style={{ width: "fit-content" }}
				/>
				{isOpened ? (
					<Fragment>
						<UIButton
							icon={icons.folder}
							text={formatMessage({ id: "container.openFolder" })}
							onClick={() => handleOpenFolder(mountDir)}
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
							onClick={handleReseal}
							style={{ width: "fit-content" }}
						/>
					</Fragment>
				) : (
					<UIButton
						icon={icons.lock}
						text={formatMessage({ id: "common.open" })}
						onClick={() => handleOpenClosedContainer(containerPath)}
						style={{ width: "fit-content" }}
					/>
				)}
			</div>
		</section>
	);
};

export { ContainerDetails };
