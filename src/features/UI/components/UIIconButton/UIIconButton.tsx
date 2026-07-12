import { cn } from "utils";
import { UIImgIcon } from "../UIImgIcon";

const UIIconButton = ({
	icon,
	disabled = false,
	active = false,
	...props
}: {
	icon: string;
	disabled?: boolean;
	active?: boolean;
} & React.HTMLAttributes<HTMLButtonElement>) => {
	return (
		<button
			type="button"
			disabled={disabled}
			className={cn(
				"flex items-center justify-center cursor-pointer bg-white/5 border border-white/10 transition-all duration-200 rounded-[10px] w-[40px] h-[40px]",
				{
					"cursor-default opacity-50": disabled,
					"hover:bg-white/10": !disabled && !active,
					"hover:brightness-110": !disabled && active,
					"border-white/10": !active,
					"border-transparent": active,
					"bg-[#2E68C4]": active,
				},
			)}
			{...props}>
			<UIImgIcon icon={icon} width={20} height={20} />
		</button>
	);
};

export { UIIconButton };
