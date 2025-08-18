import { Fragment } from "react";
import type { ContainerInfoData } from "interfaces";
import { formatLocalDateTime } from "utils";
import { UIButton } from "features/UI";

export interface DashboardContainerInfoProps {
	path: string;
	mountDir: string;
	isOpened: boolean;
	info?: ContainerInfoData;
	savedMountPath?: string;
	onOpenFolder: () => void;
	onClose: () => void;
	onOpenClosed: () => void;
	onEdit: () => void;
	icons: { folder: string; lock: string; pencil?: string };
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
	onEdit,
	icons,
}) => {
	return (
		<div className="flex flex-col gap-[20x] p-[15px] bg-white/5 rounded-[10px]">
			<div className="flex justify-start gap-[10px]">
				{isOpened ? (
					<Fragment>
						<UIButton
							icon={icons.folder}
							text="Open folder"
							onClick={onOpenFolder}
							style={{ width: "fit-content" }}
						/>
						<UIButton
							icon={icons.lock}
							text="Close"
							onClick={onClose}
							style={{ width: "fit-content" }}
						/>
						<UIButton
							icon={icons.pencil || icons.lock}
							text="Edit"
							onClick={onEdit}
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
				<p className="opacity-50">Comment:</p>
				<p>{info?.comment ?? "—"}</p>
				<p className="opacity-50">Created:</p>
				<p>{formatLocalDateTime(info?.created_at)}</p>
				<p className="opacity-50">Last reseal:</p>
				<p>{formatLocalDateTime(info?.updated_at)}</p>
				<p className="opacity-50">Tags:</p>
				<p>{(info?.tags || []).join(", ") || "—"}</p>
				<p className="opacity-50">Token:</p>
				<p>{info?.token_type ?? "—"}</p>
				<p className="opacity-50">Integrity:</p>
				<p>{info?.integrity_provider_type ?? "—"}</p>
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
