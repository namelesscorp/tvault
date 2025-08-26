import { useEffect, useRef, useState } from "react";
import { icons } from "assets";

interface UISelectProps {
	value: string;
	onChange: (value: string) => void;
	options: { value: string; label: string }[];
	placeholder?: string;
	disabled?: boolean;
	style?: React.CSSProperties;
}

const UISelect = ({
	value,
	onChange,
	options,
	placeholder,
	disabled,
	style,
}: UISelectProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const selectRef = useRef<HTMLDivElement>(null);

	const selectedOption = options.find(option => option.value === value);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				selectRef.current &&
				!selectRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleSelect = (optionValue: string) => {
		onChange(optionValue);
		setIsOpen(false);
	};

	return (
		<div ref={selectRef} className="relative" style={style}>
			<div
				className={`w-full h-[50px] bg-white/80 rounded-[10px] px-[20px] text-[18px] text-[#08091C] text-medium flex items-center justify-between cursor-pointer ${
					disabled
						? "opacity-50 cursor-not-allowed"
						: "hover:bg-white/90"
				}`}
				onClick={() => !disabled && setIsOpen(!isOpen)}>
				<span
					className={
						selectedOption ? "text-[#08091C]" : "text-[#08091C]/70"
					}>
					{selectedOption ? selectedOption.label : placeholder}
				</span>
				<img
					src={icons.arrow_down}
					alt="arrow"
					className={`w-[16px] h-[16px] transition-transform ${isOpen ? "rotate-180" : ""}`}
				/>
			</div>

			{isOpen && (
				<div className="absolute top-full left-0 right-0 mt-1 bg-white/95 rounded-[10px] shadow-lg z-50 max-h-[200px] overflow-y-auto">
					{options.map(option => (
						<div
							key={option.value}
							className={`px-[20px] py-[12px] text-[16px] text-[#08091C] cursor-pointer hover:bg-white/50 ${
								option.value === value ? "bg-white/30" : ""
							}`}
							onClick={() => handleSelect(option.value)}>
							{option.label}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export { UISelect };
