import { cn } from "utils";
import { useTheme } from "features/Theme";
import { UIImgIcon, UISwapValue } from "features/UI";

const StatsItem = ({
	title,
	value,
	hoverTitle,
	hoverValue,
	icon,
	color,
	subcolor,
	index = 0,
}: {
	title: string;
	value: string;
	hoverTitle?: string;
	hoverValue?: string;
	icon: string;
	color: string;
	subcolor: string;
	/** Only staggers the entrance, so the row of tiles arrives left to right. */
	index?: number;
}) => {
	const { resolved } = useTheme();

	return (
		<div
			style={{ animationDelay: `${index * 60}ms` }}
			className={cn(
				"group flex justify-between h-[120px] p-[15px] rounded-[10px] border bg-surface card-shadow hover-lift animate-enter-up",
				{
					"border-[#313A4F]/10": resolved === "dark",
					"border-[#000000]/70": resolved === "light",
				},
			)}>
			<div className="min-w-0 flex-1">
				<UISwapValue
					height={24}
					value={title}
					hoverValue={hoverTitle}
					className={cn(
						"block text-[16px] font-medium tracking-[-0.05em] truncate",
						{
							"text-[#ffffff]/70": resolved === "dark",
							"text-[#000000]/70": resolved === "light",
						},
					)}
				/>
				<UISwapValue
					height={36}
					value={value}
					hoverValue={hoverValue}
					className={cn(
						"block text-[24px] font-extrabold tracking-[-0.05em] truncate",
						{
							"text-[#ffffff]": resolved === "dark",
							"text-[#000000]/80": resolved === "light",
						},
					)}
				/>
			</div>
			<div
				className="flex items-center justify-center shrink-0 ml-[10px] w-[50px] h-[50px] rounded-[10px] icon-pop"
				style={{ backgroundColor: subcolor }}>
				<UIImgIcon icon={icon} width={30} height={30} color={color} />
			</div>
		</div>
	);
};

export { StatsItem };
