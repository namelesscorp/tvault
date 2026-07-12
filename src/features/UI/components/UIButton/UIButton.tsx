import { cn } from "utils";
import { UIImgIcon } from "../UIImgIcon";

const UIButton = ({
	text,
	icon,
	active = false,
	disabled = false,
	loading = false,
	noTheme = false,
	color = "#ffffff",
	center = false,
	...props
}: {
	text: string;
	icon?: string;
	active?: boolean;
	disabled?: boolean;
	/** Swaps the icon for a spinner and blocks the button while work is running. */
	loading?: boolean;
	noTheme?: boolean;
	color?: string;
	center?: boolean;
} & React.HTMLAttributes<HTMLButtonElement>) => {
	/** Coloured buttons carry their background inline, so lift them with a filter. */
	const coloured = noTheme || active;
	const themed = !noTheme && !active;

	const iconColor = noTheme ? color : active ? "#ffffff" : "var(--fg-soft)";

	return (
		<button
			type="button"
			disabled={disabled || loading}
			className={cn(
				"flex items-center gap-[10px] w-full px-[15px] rounded-[10px] h-[40px] transition-all duration-200 cursor-pointer border whitespace-nowrap press",
				{
					"justify-center": center,
					"bg-button text-fg-soft border-button-line":
						!noTheme && !active,
					"bg-[#2463EB] text-white border-transparent": active,
					"border-transparent": noTheme,
					"cursor-default opacity-50": disabled,
					"cursor-default": loading,
					"hover:bg-surface-hover": !disabled && !loading && themed,
					"hover:brightness-110 active:brightness-95":
						!disabled && !loading && coloured,
				},
				props.className,
			)}
			{...props}
			style={{
				...props.style,
				backgroundOrigin: "border-box",
			}}>
			{loading ? (
				<span
					className="w-[16px] h-[16px] rounded-full border-2 border-transparent animate-spin"
					style={{
						borderTopColor: iconColor,
						borderRightColor: iconColor,
					}}
				/>
			) : (
				icon && (
					<UIImgIcon
						icon={icon}
						width={20}
						height={20}
						color={iconColor}
					/>
				)
			)}
			{text}
		</button>
	);
};

export { UIButton };
