const UIInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
	return (
		<input
			className={
				"w-full h-[50px] bg-white/80 rounded-[10px] px-[20px] text-[18px] text-[#08091C] text-medium placeholder:text-[#08091C]/70 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [moz-appearance:textfield]"
			}
			{...props}
		/>
	);
};

export { UIInput };
