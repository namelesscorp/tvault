import { Fragment, useMemo } from "react";
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
import { icons } from "~/assets/collections/icons";
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
	const { run, result, error } = useContainerInfo();

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
				<p className="text-[20px] text-white text-medium">Container</p>
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
						<p className="opacity-50">Path:</p>
						<p>{containerPath}</p>
						{isOpened && (
							<Fragment>
								<p className="opacity-50">Mount dir:</p>
								<p className="break-all">{mountDir}</p>
							</Fragment>
						)}
						<p className="opacity-50">State:</p>
						<p>{isOpened ? "opened" : "closed"}</p>
						<p className="opacity-50">Version:</p>
						<p>{result.data?.version ?? "—"}</p>
						<p className="opacity-50">Name:</p>
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
						<p className="opacity-50">Comment:</p>
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
						<p className="opacity-50">Created:</p>
						<p>{formatLocalDateTime(result.data?.created_at)}</p>
						<p className="opacity-50">Last reseal:</p>
						<p>{formatLocalDateTime(result.data?.updated_at)}</p>
						<p className="opacity-50">Last seen:</p>
						<p>
							{formatLocalDateTime(
								new Date(
									recentItem?.lastOpenedAt ?? "",
								).toISOString(),
							)}
						</p>
						<p className="opacity-50">Tags:</p>
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
							placeholder="Enter tags (comma separated)"
						/>
						<p className="opacity-50">Token:</p>
						<p>{result.data?.token_type ?? "—"}</p>
						<p className="opacity-50">Integrity:</p>
						<p>{result.data?.integrity_provider_type ?? "—"}</p>
						{result.data?.integrity_provider_type === "hmac" && (
							<Fragment>
								<p className="opacity-50">
									Integrity Password:
								</p>
								<p>••••••••</p>
							</Fragment>
						)}
						<p className="opacity-50">Compression:</p>
						<p>{result.data?.compression_type ?? "—"}</p>
						<p className="opacity-50">Shares:</p>
						<p>{result.data?.shares ?? "—"}</p>
						<p className="opacity-50">Threshold:</p>
						<p>{result.data?.threshold ?? "—"}</p>
					</div>
				</div>
			)}
			{!!error && toast.error("Failed to get container information")}
			<div className="flex justify-start gap-[10px]">
				<UIButton
					icon={icons.back}
					text="Back"
					onClick={handleBack}
					style={{ width: "fit-content" }}
				/>
				{isOpened ? (
					<Fragment>
						<UIButton
							icon={icons.folder}
							text="Open folder"
							onClick={() => handleOpenFolder(mountDir)}
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
							onClick={handleReseal}
							style={{ width: "fit-content" }}
						/>
					</Fragment>
				) : (
					<UIButton
						icon={icons.lock}
						text="Open"
						onClick={() => handleOpenClosedContainer(containerPath)}
						style={{ width: "fit-content" }}
					/>
				)}
			</div>
		</section>
	);
};

export { ContainerDetails };
