import { useState } from "react";
import { icons } from "~/assets/collections/icons";
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
				className="absolute right-[10px] top-1/2 transform -translate-y-1/2 w-[30px] h-[30px] flex items-center justify-center cursor-pointer mask-size-[20px] bg-black hover:bg-black/80 transition-all duration-300 rounded-[10px]"
				style={{
					WebkitMask: `url("${show ? icons.eye_off : icons.eye}") no-repeat center`,
					mask: `url("${show ? icons.eye_off : icons.eye}") no-repeat center`,
				}}
			/>
		</div>
	);
};

export { UIPasswordField };
