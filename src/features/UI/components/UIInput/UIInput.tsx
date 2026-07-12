const UIInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
	<input
		type={props.type || "text"}
		className="w-full text-[16px] font-medium h-[40px] rounded-[10px] px-[15px] border bg-field border-field-line text-fg-strong placeholder:text-muted"
		{...props}
	/>
);

export { UIInput };
