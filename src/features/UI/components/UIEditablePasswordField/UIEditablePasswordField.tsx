import { useEffect, useState } from "react";
import { icons } from "assets";
import { UIInput } from "../UIInput";

interface UIEditablePasswordFieldProps {
	value: string;
	onChange: (value: string) => void;
	onSave: () => void;
	onCancel: () => void;
	isEditing: boolean;
	placeholder?: string;
	className?: string;
}

const UIEditablePasswordField: React.FC<UIEditablePasswordFieldProps> = ({
	value,
	onChange,
	onSave,
	onCancel,
	isEditing,
	placeholder = "Enter password",
	className = "",
}) => {
	const [localValue, setLocalValue] = useState(value);
	const [show, setShow] = useState(false);

	useEffect(() => {
		setLocalValue(value);
	}, [value]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			onSave();
		} else if (e.key === "Escape") {
			setLocalValue(value);
			onCancel();
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setLocalValue(newValue);
		onChange(newValue);
	};

	if (isEditing) {
		return (
			<div className="relative">
				<UIInput
					type={show ? "text" : "password"}
					value={localValue}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					className={`h-[30px] text-[15px] px-[8px] bg-white/10 border border-white/20 rounded-[5px] w-full ${className}`}
					style={{
						height: "30px",
						fontSize: "15px",
						padding: "8px 12px",
						backgroundColor: "rgba(255, 255, 255, 0.1)",
						border: "1px solid rgba(255, 255, 255, 0.2)",
						borderRadius: "5px",
						color: "white",
						paddingRight: "40px",
						width: "100%",
					}}
					autoFocus
				/>
				<button
					type="button"
					onClick={() => setShow(!show)}
					className="absolute right-[8px] top-1/2 transform -translate-y-1/2 w-[24px] h-[24px] flex items-center justify-center cursor-pointer mask-size-[16px] bg-white/20 hover:bg-white/30 transition-all duration-300 rounded-[4px]"
					style={{
						WebkitMask: `url("${show ? icons.eye_off : icons.eye}") no-repeat center`,
						mask: `url("${show ? icons.eye_off : icons.eye}") no-repeat center`,
					}}
				/>
			</div>
		);
	}

	return (
		<span className={`text-[15px] text-white ${className}`}>
			{value ? "••••••••" : "—"}
		</span>
	);
};

export { UIEditablePasswordField };
