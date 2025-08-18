import { cn } from "utils";

const UIContainerRow = ({
	text,
	active = false,
	disabled = false,
	...props
}: {
	text: string;
	active?: boolean;
	disabled?: boolean;
} & React.HTMLAttributes<HTMLButtonElement>) => {
	return (
		<button
			className={cn(
				"flex items-center w-full px-[15px] rounded-[10px] h-[50px] min-h-[50px] bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer text-white border",
				{
					"bg-[#3361D8]/10": active,
					"border-[#2E68C4]/25": active,
					"cursor-default": disabled,
					"border-white/10": !active,
				},
				props.className,
			)}
			{...props}
			title={text}
			style={{
				...props.style,
			}}>
			<span className="overflow-hidden text-ellipsis whitespace-nowrap">
				{text}
			</span>
		</button>
	);
};

export { UIContainerRow };
