import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { getSecurityScore } from "features/Dashboard/Dashboard.utils";
import { cn, formatBytes, formatLocalDateTime } from "utils";
import { selectModalPayload } from "features/Modal/state/Modal.selectors";
import {
	selectVaultContainerInfo,
	selectVaultContainers,
} from "features/Vault/state/Vault.selectors";

const ModalVaultInfo = () => {
	const { formatMessage } = useIntl();

	const path = useSelector(selectModalPayload);
	const infoMap = useSelector(selectVaultContainerInfo);
	const containers = useSelector(selectVaultContainers);

	const info = infoMap[path];
	const mountDir = containers[path];
	const securityScore = getSecurityScore(info);

	const rows: [string, string][] = [
		[formatMessage({ id: "container.name" }), info?.name || "—"],
		[formatMessage({ id: "container.token" }), info?.token_type || "—"],
		...(info?.token_type === "share"
			? ([
					[
						formatMessage({ id: "container.shares" }),
						String(info?.shares ?? "—"),
					],
					[
						formatMessage({ id: "container.threshold" }),
						String(info?.threshold ?? "—"),
					],
				] as [string, string][])
			: []),
		[
			formatMessage({ id: "container.tags" }),
			info?.tags?.length ? info.tags.join(", ") : "—",
		],
		[formatMessage({ id: "container.comment" }), info?.comment || "—"],
		[
			formatMessage({ id: "container.integrity" }),
			info?.integrity_provider_type === "hmac" ? "HMAC-SHA256" : "—",
		],
		[
			formatMessage({ id: "container.compression" }),
			info?.compression_type || "—",
		],
		[
			formatMessage({ id: "container.files" }),
			info?.file_count !== undefined
				? info.file_count.toLocaleString()
				: "—",
		],
		[
			formatMessage({ id: "container.size" }),
			formatBytes(info?.compressed_size),
		],
		[
			formatMessage({ id: "container.sizeOriginal" }),
			formatBytes(info?.uncompressed_size),
		],
		[
			formatMessage({ id: "container.security" }),
			securityScore === null ? "—" : `${securityScore}%`,
		],
		[formatMessage({ id: "container.containerPath" }), path || "—"],
		[
			formatMessage({ id: "container.created" }),
			formatLocalDateTime(info?.created_at),
		],
		[
			formatMessage({ id: "container.lastReseal" }),
			formatLocalDateTime(info?.updated_at),
		],
		[formatMessage({ id: "container.mountPath" }), mountDir || "—"],
		[
			formatMessage({ id: "container.version" }),
			String(info?.version ?? "—"),
		],
	];

	return (
		<div
			className={cn(
				"w-full flex flex-col gap-[10px] border rounded-[10px] p-[15px] bg-surface border-line",
			)}>
			{rows.map(([label, value]) => (
				<div
					key={label}
					className="flex items-start justify-between gap-[20px]">
					<p
						className={cn(
							"text-[14px] font-medium tracking-[-0.05em] shrink-0 text-muted",
						)}>
						{label}:
					</p>
					<p
						className={cn(
							"text-[14px] font-medium tracking-[-0.05em] text-right min-w-0 [overflow-wrap:anywhere] text-fg",
						)}>
						{value}
					</p>
				</div>
			))}
		</div>
	);
};

export { ModalVaultInfo };
