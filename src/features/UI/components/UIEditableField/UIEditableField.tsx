import { useEffect, useState } from "react";
import { UIInput } from "../UIInput";

interface UIEditableFieldProps {
	value: string;
	onChange: (value: string) => void;
	onSave: () => void;
	onCancel: () => void;
	isEditing: boolean;
	placeholder?: string;
	className?: string;
}

const UIEditableField: React.FC<UIEditableFieldProps> = ({
	value,
	onChange,
	onSave,
	onCancel,
	isEditing,
	placeholder,
	className = "",
}) => {
	const [localValue, setLocalValue] = useState(value);

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

	if (isEditing) {
		return (
			<UIInput
				value={localValue}
				onChange={e => {
					setLocalValue(e.target.value);
					onChange(e.target.value);
				}}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				className={`h-[30px] text-[15px] px-[8px] bg-white/10 border border-white/20 rounded-[5px] ${className}`}
				style={{
					height: "30px",
					fontSize: "15px",
					padding: "8px 12px",
					backgroundColor: "rgba(255, 255, 255, 0.1)",
					border: "1px solid rgba(255, 255, 255, 0.2)",
					borderRadius: "5px",
					color: "white",
				}}
				autoFocus
			/>
		);
	}

	return (
		<span className={`text-[15px] text-white ${className}`}>
			{value || "—"}
		</span>
	);
};

export { UIEditableField };
