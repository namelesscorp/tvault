import { cn } from "utils";

/**
 * Cross-fades one value into another on hover. Driven by `group-hover`, so the
 * hover target is whatever ancestor carries the `group` class — usually the whole
 * cell, not just the text.
 *
 * Both texts are absolutely positioned so they can swap without moving anything
 * around them; an invisible copy of the longer one gives the box its width, and a
 * fixed height keeps it from jumping. The box is deliberately not clipped —
 * `overflow: hidden` would cut the descenders of letters like "g".
 */
const UISwapValue = ({
	value,
	hoverValue,
	height,
	className,
}: {
	value: string;
	hoverValue?: string;
	/** Should match the line height of the text, otherwise the box would jump. */
	height: number;
	className?: string;
}) => {
	if (!hoverValue || hoverValue === value) {
		return <span className={className}>{value}</span>;
	}

	const layer =
		"absolute inset-0 block whitespace-nowrap transition-all duration-300 ease-out";
	const widest = hoverValue.length > value.length ? hoverValue : value;

	return (
		<span
			className="relative block"
			style={{ height: `${height}px` }}
			aria-label={`${value} (${hoverValue})`}>
			<span
				aria-hidden
				className={cn("block invisible whitespace-nowrap", className)}>
				{widest}
			</span>
			<span
				className={cn(
					layer,
					"group-hover:-translate-y-[6px] group-hover:opacity-0",
					className,
				)}>
				{value}
			</span>
			<span
				className={cn(
					layer,
					"translate-y-[6px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
					className,
				)}>
				{hoverValue}
			</span>
		</span>
	);
};

export { UISwapValue };
