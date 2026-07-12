import { ReactNode } from "react";
import { cn } from "utils";

/** Shared dimmed backdrop for everything that floats above the app. */
const UIOverlay = ({
	children,
	onClose,
	visible = true,
	className,
}: {
	children: ReactNode;
	onClose?: () => void;
	visible?: boolean;
	className?: string;
}) => {
	return (
		<div
			onClick={event => {
				if (event.target === event.currentTarget) onClose?.();
			}}
			className={cn(
				"fixed top-0 left-0 z-50 w-full h-full flex items-center justify-center bg-scrim backdrop-blur-sm transition-opacity duration-200 ease-out",
				{
					"opacity-100": visible,
					/** Ignore clicks while it animates out. */
					"opacity-0 pointer-events-none": !visible,
				},
				className,
			)}>
			{children}
		</div>
	);
};

export { UIOverlay };
