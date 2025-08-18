import { Fragment, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { RouteTypes } from "interfaces";
import { formatLocalDateTime } from "utils";
import { UIButton, UIImgIcon } from "features/UI";
import { icons } from "~/assets/collections/icons";
import { useContainerInfo, useVault } from "../../hooks";
import {
	selectVaultContainers,
	selectVaultRecent,
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
		handleEditContainer,
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

	useMemo(() => {
		if (containerPath) {
			run(containerPath).catch(() => {});
		}
	}, [containerPath]);

	if (!containerPath) {
		toast.error("Invalid container identifier");
		return null;
	}

	const recentItem = recent.find(r => r.path === containerPath);

	const handleBack = () => {
		navigate(RouteTypes.Dashboard);
	};

	return (
		<section className="flex flex-col gap-[20px]">
			<div className="flex items-center gap-[20px]">
				<UIImgIcon icon={icons.folder} width={30} height={30} />
				<p className="text-[20px] text-white text-medium">Container</p>
			</div>
			{!!result?.data && (
				<div className="p-[15px] bg-white/5 rounded-[10px] grid grid-cols-2 gap-y-[10px] text-[15px] text-white">
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
					<p className="opacity-50">Comment:</p>
					<p>{result.data?.comment ?? "—"}</p>
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
					<p>{(result.data?.tags as string[]).join(", ") || "—"}</p>
					<p className="opacity-50">Token:</p>
					<p>{result.data?.token_type ?? "—"}</p>
					<p className="opacity-50">Integrity:</p>
					<p>{result.data?.integrity_provider_type ?? "—"}</p>
					<p className="opacity-50">Compression:</p>
					<p>{result.data?.compression_type ?? "—"}</p>
					<p className="opacity-50">Shares:</p>
					<p>{result.data?.shares ?? "—"}</p>
					<p className="opacity-50">Threshold:</p>
					<p>{result.data?.threshold ?? "—"}</p>
				</div>
			)}
			{!!error && toast.error("Failed to get container information")}
			<div className="flex justify-start gap-[10px]">
				{isOpened ? (
					<Fragment>
						<UIButton
							icon={icons.folder}
							text="Open folder"
							onClick={() => handleOpenFolder(mountDir)}
							style={{ width: "fit-content" }}
						/>
						<UIButton
							icon={icons.lock}
							text="Close"
							onClick={() =>
								handleCloseContainer(containerPath, mountDir)
							}
							style={{ width: "fit-content" }}
						/>
						<UIButton
							icon={icons.lock}
							text="Edit"
							onClick={handleEditContainer}
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
				<UIButton
					icon={icons.back}
					text="Back"
					onClick={handleBack}
					style={{ width: "fit-content" }}
				/>
			</div>
		</section>
	);
};

export { ContainerDetails };
