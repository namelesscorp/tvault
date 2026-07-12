import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { cn } from "utils";
import { UIButton, UIImgIcon } from "features/UI";
import { icons } from "assets/collections/icons";
import { useAppDispatch } from "~/features/Store";
import { filterTypes } from "../../Filters.model";
import {
	filtersSetFilterType,
	filtersSetSearchValue,
} from "../../state/Filters.actions";
import {
	selectFiltersFilterType,
	selectFiltersSearchValue,
} from "../../state/Filters.selectors";

const Filters = () => {
	const { formatMessage } = useIntl();
	const filterType = useSelector(selectFiltersFilterType);
	const searchValue = useSelector(selectFiltersSearchValue);
	const dispatch = useAppDispatch();

	return (
		<div className="flex items-center gap-[20px]">
			<div
				className={cn(
					"flex items-center flex-1 gap-[15px] h-[40px] rounded-[10px] px-[15px] border bg-surface border-line",
				)}>
				<UIImgIcon
					icon={icons.search}
					width={25}
					height={25}
					color={"var(--fg)"}
				/>
				<input
					type="text"
					value={searchValue}
					onChange={e =>
						dispatch(filtersSetSearchValue(e.target.value))
					}
					placeholder={formatMessage({ id: "filters.search" })}
					className={cn(
						"flex-1 bg-transparent outline-none text-[16px] font-medium text-fg-strong placeholder:text-muted",
					)}
				/>
				<UIImgIcon
					icon={icons.grid_2}
					width={25}
					height={25}
					color={"var(--fg)"}
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
