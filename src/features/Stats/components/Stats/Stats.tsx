import { useMemo } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { getSecurityScore } from "features/Dashboard/Dashboard.utils";
import { useTheme } from "features/Theme";
import {
	selectVaultContainerInfo,
	selectVaultContainers,
	selectVaultRecent,
} from "features/Vault/state/Vault.selectors";
import { icons } from "~/assets/collections/icons";
import { StatsItem } from "../StatsItem";

const Stats = () => {
	const { formatMessage } = useIntl();
	const { resolved } = useTheme();

	const containers = useSelector(selectVaultContainers);
	const recent = useSelector(selectVaultRecent);
	const infoMap = useSelector(selectVaultContainerInfo);

	const knownPaths = useMemo(
		() =>
			Array.from(
				new Set([
					...Object.keys(containers),
					...recent.map(r => r.path),
				]),
			),
		[containers, recent],
	);

	const securityScore = useMemo(() => {
		if (knownPaths.length === 0) return 0;
		const total = knownPaths.reduce(
			(sum, path) => sum + getSecurityScore(infoMap[path]),
			0,
		);
		return Math.round(total / knownPaths.length);
	}, [knownPaths, infoMap]);

	return (
		<div className="grid grid-cols-4 gap-[40px]">
			<StatsItem
				title={formatMessage({ id: "stats.1" })}
				value={String(knownPaths.length)}
				icon={icons.folder_shield}
				color={"var(--accent)"}
				subcolor={
					resolved === "dark" ? "#20314D" : "rgba(154, 199, 255, 0.5)"
				}
			/>
			<StatsItem
				title={formatMessage({ id: "stats.2" })}
				value={"3,434"}
				icon={icons.file}
				color={resolved === "dark" ? "#C084FC" : "#A143FF"}
				subcolor={
					resolved === "dark"
						? "#2E2F4F"
						: "rgba(192, 132, 252, 0.51)"
				}
			/>
			<StatsItem
				title={formatMessage({ id: "stats.3" })}
				value={"20.3 GB"}
				icon={icons.database}
				color={resolved === "dark" ? "#25D0EA" : "#3A73ED"}
				subcolor={resolved === "dark" ? "#21384E" : "#D5DFFE"}
			/>
			<StatsItem
				title={formatMessage({ id: "stats.4" })}
				value={`${securityScore}%`}
				icon={icons.shield}
				color={"var(--success)"}
				subcolor={resolved === "dark" ? "#253C44" : "#DAF4E0"}
			/>
		</div>
	);
};

export { Stats };
