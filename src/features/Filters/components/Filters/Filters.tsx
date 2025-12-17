import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { cn } from "utils";
import { useTheme } from "features/Theme";
import { UIButton, UIImgIcon } from "features/UI";
import { icons } from "assets/collections/icons";
import { useAppDispatch } from "~/features/Store";
import { filterTypes } from "../../Filters.model";
import { filtersSetFilterType } from "../../state/Filters.actions";
import { selectFiltersFilterType } from "../../state/Filters.selectors";

const Filters = () => {
	const { resolved } = useTheme();
	const { formatMessage } = useIntl();
	const filterType = useSelector(selectFiltersFilterType);
	const dispatch = useAppDispatch();

	return (
		<div className="flex items-center gap-[20px]">
			<div
				className={cn(
					"flex items-center flex-1 gap-[15px] h-[40px] rounded-[10px] px-[15px] border",
					{
						"bg-white/3": resolved === "dark",
						"bg-white/80": resolved === "light",
						"border-[#313A4F]": resolved === "dark",
						"border-black/70": resolved === "light",
					},
				)}>
				<UIImgIcon
					icon={icons.search}
					width={25}
					height={25}
					color={
						resolved === "dark" ? "#ffffff" : "rgba(0, 0, 0, 0.8)"
					}
				/>
				<input
					type="text"
					placeholder={formatMessage({ id: "filters.search" })}
					className={cn(
						"flex-1 bg-transparent outline-none text-[16px] font-medium",
						{
							"placeholder:text-white/70": resolved === "dark",
							"placeholder:text-black/70": resolved === "light",
							"text-white": resolved === "dark",
							"text-black": resolved === "light",
						},
					)}
				/>
				<UIImgIcon
					icon={icons.grid_2}
					width={25}
					height={25}
					color={
						resolved === "dark" ? "#ffffff" : "rgba(0, 0, 0, 0.8)"
					}
				/>
			</div>
			{filterTypes.map(filter => (
				<UIButton
					key={filter.value}
					text={formatMessage({ id: filter.label })}
					icon={filter.icon}
					active={filter.value === filterType}
					onClick={() => dispatch(filtersSetFilterType(filter.value))}
					style={{
						width: "fit-content",
					}}
				/>
			))}
		</div>
	);
};

export { Filters };
