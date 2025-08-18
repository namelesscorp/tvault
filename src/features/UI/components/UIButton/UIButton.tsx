import { cn } from "utils";
import { UIImgIcon } from "../UIImgIcon";

const UIButton = ({
	text,
	icon,
	active = false,
	disabled = false,
	...props
}: {
	text: string;
	icon?: string;
	active?: boolean;
	disabled?: boolean;
} & React.HTMLAttributes<HTMLButtonElement>) => {
	return (
		<button
			className={cn(
				"flex items-center gap-[15px] w-full px-[15px] rounded-[10px] h-[50px] bg-white/5 transition-all duration-300 cursor-pointer text-white border",
				{
					"bg-[#2E68C4]": active,
					"cursor-default opacity-50": disabled,
					"hover:bg-white/10": !disabled,
					"border-white/10": !active,
					"border-transparent": active,
				},
				props.className,
			)}
			{...props}
			style={{
				...props.style,
				backgroundColor: active ? "#2E68C4" : "",
			}}>
			{icon && <UIImgIcon icon={icon} width={20} height={20} />}
			{text}
		</button>
	);
};

export { UIButton };
