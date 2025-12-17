import { cn } from "utils";
import { useTheme } from "features/Theme";

const UIInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
	const { resolved } = useTheme();

	return (
		<input
			type={props.type || "text"}
			className={cn(
				"w-full text-[16px] font-medium h-[40px] rounded-[10px] px-[15px] border",
				{
					"placeholder:text-white/70": resolved === "dark",
					"placeholder:text-black/70": resolved === "light",
					"text-white": resolved === "dark",
					"text-black": resolved === "light",
					"bg-white/80": resolved === "light",
					"bg-[#313A4F]": resolved === "dark",
					"border-black/70": resolved === "light",
					"border-white/3": resolved === "dark",
				},
			)}
			{...props}
		/>
	);
};

export { UIInput };
