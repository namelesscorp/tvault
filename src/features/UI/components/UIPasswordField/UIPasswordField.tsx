import { useState } from "react";
import { cn } from "utils";
import { useTheme } from "features/Theme";
import { icons } from "assets";
import { UIInput } from "../UIInput";

export interface UIPasswordFieldProps {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
	placeholder?: string;
	className?: string;
	style?: React.CSSProperties;
	disabled?: boolean;
}

const UIPasswordField = ({
	value,
	onChange,
	onKeyDown,
	placeholder = "Enter password",
	style,
	disabled,
}: UIPasswordFieldProps) => {
	const [show, setShow] = useState(false);
	const { resolved } = useTheme();

	return (
		<div className="relative" style={style}>
			<UIInput
				type={show ? "text" : "password"}
				value={value}
				onChange={onChange}
				onKeyDown={onKeyDown}
				placeholder={placeholder}
				disabled={disabled}
				style={{ paddingRight: "50px" }}
			/>
			<button
				type="button"
				onClick={() => setShow(!show)}
				className={cn(
					"absolute right-[10px] top-1/2 transform -translate-y-1/2 w-[30px] h-[30px] flex items-center justify-center cursor-pointer mask-size-[20px] transition-all duration-300 rounded-[10px]",
					{
						"bg-white": resolved === "dark",
						"bg-black": resolved === "light",
						"hover:bg-white/80": resolved === "dark",
						"hover:bg-black/80": resolved === "light",
					},
				)}
				style={{
					WebkitMask: `url("${show ? icons.eye_off : icons.eye}") no-repeat center`,
					mask: `url("${show ? icons.eye_off : icons.eye}") no-repeat center`,
				}}
			/>
		</div>
	);
};

export { UIPasswordField };
