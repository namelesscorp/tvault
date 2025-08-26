import { cn } from "utils";
import { icons } from "assets";

interface UICheckboxProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	label: string;
	disabled?: boolean;
	className?: string;
}

const UICheckbox = ({
	checked,
	onChange,
	label,
	disabled = false,
	className,
}: UICheckboxProps) => {
	return (
		<div
			className={cn(
				"flex items-center gap-[10px] cursor-pointer",
				{
					"cursor-default opacity-50": disabled,
				},
				className,
			)}
			onClick={() => !disabled && onChange(!checked)}>
			<div
				className={cn(
					"w-[20px] h-[20px] border-2 rounded-[4px] flex items-center justify-center transition-all duration-300",
					{
						"border-white/30": !checked,
						"border-[#2E68C4] bg-[#2E68C4]": checked,
					},
				)}>
				{checked && (
					<div
						className="w-[16px] h-[16px] bg-white mask-position-center"
						style={{
							WebkitMask: `url("${icons.check}") no-repeat center`,
							mask: `url("${icons.check}") no-repeat center`,
							maskSize: "16px",
							WebkitMaskSize: "16px",
						}}
					/>
				)}
			</div>
			<span className="text-white text-[16px]">{label}</span>
		</div>
	);
};

export { UICheckbox };
