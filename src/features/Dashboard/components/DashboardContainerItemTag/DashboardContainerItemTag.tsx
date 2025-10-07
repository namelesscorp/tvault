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
			className="flex items-center gap-[5px] h-[20px] px-[10px] rounded-[10px]"
			style={{ backgroundColor: bgColor, color: textColor }}>
			{icon && (
				<UIImgIcon
					icon={icon}
					width={15}
					height={15}
					color={textColor}
				/>
			)}
			<p
				className="text-[11px] tracking-[-0.05em] font-bold"
				style={{ color: textColor }}>
				{text}
			</p>
		</div>
	);
};

export { DashboardContainerItemTag };
