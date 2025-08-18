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
			className={`mask-contain mask-no-repeat ${pointer ? "cursor-pointer" : ""}`}
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
