import { UIImgIcon } from "~/features/UI";

const DashboardContainerItemTag = ({
	text,
	bgColor,
	textColor,
	icon,
}: {
	text: string;
	bgColor: string;
	textColor: string;
	icon?: string;
}) => {
	return (
		<div
			title={text}
			className="flex items-center gap-[5px] max-w-full h-[20px] px-[10px] rounded-[10px]"
			style={{ backgroundColor: bgColor, color: textColor }}>
			{icon && (
				<UIImgIcon
					icon={icon}
					width={15}
					height={15}
					color={textColor}
					style={{ flexShrink: 0 }}
				/>
			)}
			{/** A user-defined tag can be longer than the whole card, so the label
			 * cuts itself off rather than dragging the pill past the card edge. */}
			<p
				className="text-[11px] tracking-[-0.05em] font-bold whitespace-nowrap overflow-hidden text-ellipsis"
				style={{ color: textColor }}>
				{text}
			</p>
		</div>
	);
};

export { DashboardContainerItemTag };
