import { cn } from "utils";
import { useTheme } from "features/Theme";

interface UIToggleProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
	className?: string;
}

const UIToggle = ({
	checked,
	onChange,
	disabled = false,
	className,
}: UIToggleProps) => {
	const { resolved } = useTheme();

	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			disabled={disabled}
			onClick={() => onChange(!checked)}
			className={cn(
				"relative w-[45px] h-[25px] rounded-[30px] transition-all duration-300 cursor-pointer shrink-0",
				{
					"bg-[#2463EB]": checked && resolved === "dark",
					"bg-[#3A73ED]": checked && resolved === "light",
					"bg-white/15": !checked && resolved === "dark",
					"bg-black/15": !checked && resolved === "light",
					"cursor-default opacity-50": disabled,
				},
				className,
			)}>
			<span
				className={cn(
					"absolute top-[3px] w-[20px] h-[20px] rounded-full bg-white transition-all duration-300",
					checked ? "left-[23px]" : "left-[2px]",
				)}
			/>
		</button>
	);
};

export { UIToggle };
