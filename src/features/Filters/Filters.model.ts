import { icons } from "assets/collections/icons";

export type FilterType = "all" | "locked" | "unlocked";

export const filterTypes: { value: FilterType; label: string; icon: string }[] =
	[
		{
			value: "all",
			label: "filters.all",
			icon: icons.filter,
		},
		{
			value: "locked",
			label: "filters.locked",
			icon: icons.lock,
		},
		{
			value: "unlocked",
			label: "filters.unlocked",
			icon: icons.unlock,
		},
	];
