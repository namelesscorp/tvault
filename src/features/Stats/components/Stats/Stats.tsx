import { useMemo } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import {
	getSecurityColors,
	getSecurityScore,
} from "features/Dashboard/Dashboard.utils";
import { formatBytes, useCountUp } from "utils";
import { useAnimations } from "features/App";
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

	/** Everything below comes from the container metadata the core reports. */
	const totals = useMemo(() => {
		let files = 0;
		let size = 0;
		let original = 0;
		let scoreSum = 0;
		let scored = 0;

		knownPaths.forEach(path => {
			const info = infoMap[path];
			files += info?.file_count ?? 0;
			size += info?.compressed_size ?? 0;
			original += info?.uncompressed_size ?? 0;

			const score = getSecurityScore(info);
			if (score !== null) {
				scoreSum += score;
				scored += 1;
			}
		});

		return {
			files,
			size,
			original,
			score: scored > 0 ? Math.round(scoreSum / scored) : null,
		};
	}, [knownPaths, infoMap]);

	/** Neutral while there is nothing to score yet. */
	const securityColors =
		totals.score === null
			? { text: "var(--muted)", tint: "var(--surface)" }
			: getSecurityColors(totals.score);

	/** The tiles count to their totals; the colours are already final meanwhile. */
	const { enabled: animations } = useAnimations();
	const options = { enabled: animations };
	const countedContainers = useCountUp(knownPaths.length, options);
	const countedFiles = useCountUp(totals.files, options);
	const countedSize = useCountUp(totals.size, options);
	const countedScore = useCountUp(totals.score ?? 0, options);

	return (
		<div className="grid grid-cols-4 gap-[20px]">
			<StatsItem
				index={0}
				title={formatMessage({ id: "stats.1" })}
				value={String(Math.round(countedContainers))}
				icon={icons.folder_shield}
				color={"var(--accent)"}
				subcolor={
					resolved === "dark" ? "#20314D" : "rgba(154, 199, 255, 0.5)"
				}
			/>
			<StatsItem
				index={1}
				title={formatMessage({ id: "stats.2" })}
				value={Math.round(countedFiles).toLocaleString()}
				icon={icons.file}
				color={resolved === "dark" ? "#C084FC" : "#A143FF"}
				subcolor={
					resolved === "dark"
						? "#2E2F4F"
						: "rgba(192, 132, 252, 0.51)"
				}
			/>
			<StatsItem
				index={2}
				title={formatMessage({ id: "stats.3" })}
				value={formatBytes(countedSize)}
				hoverTitle={formatMessage({ id: "stats.3.hover" })}
				hoverValue={
					totals.original && totals.original !== totals.size
						? formatBytes(totals.original)
						: undefined
				}
				icon={icons.database}
				color={resolved === "dark" ? "#25D0EA" : "#3A73ED"}
				subcolor={resolved === "dark" ? "#21384E" : "#D5DFFE"}
			/>
			<StatsItem
				index={3}
				title={formatMessage({ id: "stats.4" })}
				value={
					totals.score === null ? "—" : `${Math.round(countedScore)}%`
				}
				icon={icons.shield}
				color={securityColors.text}
				subcolor={securityColors.tint}
			/>
		</div>
	);
};

export { Stats };
