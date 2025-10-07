import { cn } from "utils";
import { useTheme } from "features/Theme";
import { UIImgIcon } from "../UIImgIcon";

const UIButton = ({
	text,
	icon,
	active = false,
	disabled = false,
	noTheme = false,
	color = "#ffffff",
	center = false,
	...props
}: {
	text: string;
	icon?: string;
	active?: boolean;
	disabled?: boolean;
	noTheme?: boolean;
	color?: string;
	center?: boolean;
} & React.HTMLAttributes<HTMLButtonElement>) => {
	const { resolved } = useTheme();

	const iconColor = noTheme
		? color
		: active
			? "#ffffff"
			: resolved === "dark"
				? "#ffffff"
				: "rgba(0, 0, 0, 0.70)";

	return (
		<button
			className={cn(
				"flex items-center gap-[10px] w-full px-[15px] rounded-[10px] h-[40px] transition-all duration-300 cursor-pointer border whitespace-nowrap",
				{
					"justify-center": center,
					"bg-[#2D384E]": resolved === "dark" && !noTheme,
					"bg-white/80": resolved === "light" && !noTheme,
					"bg-[#2463EB]": active,
					"text-black/70": resolved === "light" && !noTheme,
					"text-white": (resolved === "dark" && !noTheme) || active,
					"cursor-default opacity-50": disabled,
					"hover:bg-[#2D384E]/80":
						!disabled && resolved === "dark" && !noTheme && !active,
					"hover:bg-white/70":
						!disabled &&
						resolved === "light" &&
						!noTheme &&
						!active,
					"border-[#6D7482]": resolved === "dark" && !noTheme,
					"border-black/70": resolved === "light" && !noTheme,
					"border-transparent": active || noTheme,
				},
				props.className,
			)}
			{...props}
			style={{
				...props.style,
			}}>
			{icon && (
				<UIImgIcon
					icon={icon}
					width={20}
					height={20}
					color={iconColor}
				/>
			)}
			{text}
		</button>
	);
};

export { UIButton };
