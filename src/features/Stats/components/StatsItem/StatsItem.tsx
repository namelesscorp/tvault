import { cn } from "utils";
import { useTheme } from "features/Theme";
import { UIImgIcon } from "features/UI";

const StatsItem = ({
	title,
	value,
	icon,
	color,
	subcolor,
}: {
	title: string;
	value: string;
	icon: string;
	color: string;
	subcolor: string;
}) => {
	const { resolved } = useTheme();

	return (
		<div
			className={cn(
				"flex justify-between h-[120px] p-[15px] rounded-[10px] border bg-surface card-shadow",
				{
					"border-[#313A4F]/10": resolved === "dark",
					"border-[#000000]/70": resolved === "light",
				},
			)}>
			<div>
				<p
					className={cn(
						"text-[16px] font-medium tracking-[-0.05em]",
						{
							"text-[#ffffff]/70": resolved === "dark",
							"text-[#000000]/70": resolved === "light",
						},
					)}>
					{title}
				</p>
				<p
					className={cn(
						"text-[24px] font-extrabold tracking-[-0.05em]",
						{
							"text-[#ffffff]": resolved === "dark",
							"text-[#000000]/80": resolved === "light",
						},
					)}>
					{value}
				</p>
			</div>
			<div
				className="flex items-center justify-center w-[50px] h-[50px] rounded-[10px]"
				style={{ backgroundColor: subcolor }}>
				<UIImgIcon icon={icon} width={30} height={30} color={color} />
			</div>
		</div>
	);
};

export { StatsItem };
