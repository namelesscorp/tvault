import { useIntl } from "react-intl";
import { useTheme } from "features/Theme";
import { icons } from "~/assets/collections/icons";
import { StatsItem } from "../StatsItem";

const Stats = () => {
	const { formatMessage } = useIntl();
	const { resolved } = useTheme();

	return (
		<div className="grid grid-cols-4 gap-[40px]">
			<StatsItem
				title={formatMessage({ id: "stats.1" })}
				value={"4"}
				icon={icons.folder_shield}
				color={resolved === "dark" ? "#538DD5" : "#1353A3"}
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
				value={"94%"}
				icon={icons.shield}
				color={resolved === "dark" ? "#49DE80" : "#2E9253"}
				subcolor={resolved === "dark" ? "#253C44" : "#DAF4E0"}
			/>
		</div>
	);
};

export { Stats };
