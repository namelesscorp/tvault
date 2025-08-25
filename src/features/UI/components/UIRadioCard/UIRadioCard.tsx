import { cn } from "utils";

interface UIRadioCardProps {
	title: string;
	subtitle: string;
	selected: boolean;
	onClick: () => void;
}

const UIRadioCard = ({
	title,
	subtitle,
	selected,
	onClick,
}: UIRadioCardProps) => (
	<div
		className={cn(
			"flex flex-col gap-[8px] cursor-pointer p-[15px] items-center justify-center bg-white/5 border border-white/10 rounded-[10px] transition-all duration-300",
			{
				"bg-[#3361D8]/10 border-[#2E68C4]/50": selected,
			},
		)}
		onClick={onClick}>
		<p className="text-[16px] text-white text-medium text-center">
			{title}
		</p>
		<p className="text-[14px] text-white/30 text-medium text-center">
			{subtitle}
		</p>
	</div>
);

export { UIRadioCard };
