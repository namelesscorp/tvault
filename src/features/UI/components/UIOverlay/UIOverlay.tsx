import { ReactNode, useRef } from "react";
import { createPortal } from "react-dom";
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
	/**
	 * A click event fires on the nearest common ancestor of press and release, so
	 * pressing inside the dialog and releasing on the backdrop would land here and
	 * close it — e.g. when selecting text and overshooting. Only treat it as a
	 * backdrop click when the press started on the backdrop too.
	 */
	const pressedOnBackdrop = useRef(false);

	/**
	 * Rendered into <body>, never in place. `position: fixed` is measured from the
	 * nearest transformed ancestor rather than from the viewport, so an overlay left
	 * inside e.g. an animated dashboard card would anchor itself to that card the
	 * moment it lifts on hover — and snap back to the middle of the screen when it
	 * settles. The portal keeps it out of reach of whatever its owner does.
	 */
	return createPortal(
		<div
			onMouseDown={event => {
				pressedOnBackdrop.current =
					event.target === event.currentTarget;
			}}
			onClick={event => {
				if (!pressedOnBackdrop.current) return;
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
		</div>,
		document.body,
	);
};

export { UIOverlay };
