const UIInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
	<input
		type={props.type || "text"}
		/**
		 * The webview capitalises the first letter and autocorrects the rest by
		 * default. That is wrong for every field in this app: names, paths, passwords
		 * and tokens are all case-sensitive, and a silently upper-cased first letter
		 * of a password is impossible for the user to see.
		 */
		autoCapitalize="off"
		autoCorrect="off"
		autoComplete="off"
		spellCheck={false}
		className="w-full text-[16px] font-medium h-[40px] rounded-[10px] px-[15px] border bg-field border-field-line text-fg-strong placeholder:text-muted"
		{...props}
	/>
);

export { UIInput };
