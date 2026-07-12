import { useIntl } from "react-intl";
import { useTheme } from "features/Theme";
import { UIImgIcon } from "features/UI";
import { icons } from "assets/collections/icons";

/**
 * Shown both when there is nothing to list and when a search or filter matched
 * nothing — the design uses the same card for both, only the wording differs.
 */
const DashboardEmpty = ({
	title,
	description,
}: {
	title: string;
	description: string;
}) => {
	const { formatMessage } = useIntl();
	const { resolved } = useTheme();

	return (
		<div className="flex justify-center pt-[10px]">
			<div className="flex flex-col items-center justify-center gap-[10px] w-[450px] h-[300px] rounded-[10px] border bg-surface border-line card-shadow animate-enter-up">
				<div className="flex items-center justify-center w-[65px] h-[65px] rounded-full bg-app animate-float">
					<UIImgIcon
						icon={icons.lock}
						width={30}
						height={30}
						color={resolved === "dark" ? "#60A5FA" : "#2463EB"}
					/>
				</div>
				<p className="text-[24px] font-bold tracking-[-0.05em] text-fg">
					{formatMessage({ id: title })}
				</p>
				<p className="text-[16px] font-medium tracking-[-0.05em] text-muted">
					{formatMessage({ id: description })}
				</p>
			</div>
		</div>
	);
};

export { DashboardEmpty };
