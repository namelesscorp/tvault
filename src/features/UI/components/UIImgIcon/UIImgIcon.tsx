const UIImgIcon = ({
	icon,
	color = "#ffffff",
	width = 20,
	height = 20,
	pointer = false,
	...props
}: {
	icon: string;
	color?: string;
	width?: number;
	height?: number;
	pointer?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) => {
	return (
		<div
			{...props}
			className={`mask-contain mask-no-repeat transition-all duration-200 ${pointer ? "cursor-pointer hover:opacity-70" : ""}`}
			style={{
				width: `${width}px`,
				height: `${height}px`,
				maskImage: `url("${icon}")`,
				WebkitMaskImage: `url("${icon}")`,
				backgroundColor: color,
				...props.style,
			}}
		/>
	);
};

export { UIImgIcon };
