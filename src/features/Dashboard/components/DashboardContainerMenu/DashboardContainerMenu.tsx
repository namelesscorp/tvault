import { useEffect } from "react";
import { cn, useMountTransition } from "utils";
import { useTheme } from "features/Theme";
import { UIOverlay } from "features/UI";

export interface DashboardContainerMenuItem {
	key: string;
	label: string;
	danger?: boolean;
	disabled?: boolean;
	onClick: () => void;
}

const DashboardContainerMenu = ({
	open,
	items,
	onClose,
}: {
	open: boolean;
	items: DashboardContainerMenuItem[];
	onClose: () => void;
}) => {
	const { resolved } = useTheme();
	const { mounted, visible } = useMountTransition(open);

	useEffect(() => {
		if (!open) return;

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [onClose, open]);

	if (!mounted) {
		return null;
	}

	return (
		<UIOverlay onClose={onClose} visible={visible}>
			<div
				className={cn(
					"w-[400px] max-w-[calc(100vw-40px)] rounded-[10px] border overflow-hidden transition-all duration-200 ease-out origin-center card-shadow",
					{
						"opacity-100 scale-100 translate-y-0": visible,
						"opacity-0 scale-95 translate-y-[10px]": !visible,
						"bg-[#1E293B] border-[#313A4F]": resolved === "dark",
						"bg-[#F5F7FF] border-black/70": resolved === "light",
					},
				)}>
				{items.map((item, index) => (
					<button
						key={item.key}
						type="button"
						disabled={item.disabled}
						onClick={() => {
							item.onClick();
							onClose();
						}}
						className={cn(
							"flex items-center justify-center w-full h-[60px] text-[24px] font-bold tracking-[-0.05em] transition-all duration-300 cursor-pointer",
							{
								"border-t": index !== 0,
								"border-[#313A4F]":
									index !== 0 && resolved === "dark",
								"border-black/70":
									index !== 0 && resolved === "light",
								"text-white":
									!item.danger && resolved === "dark",
								"text-black/80":
									!item.danger && resolved === "light",
								"text-[rgba(255,56,56,0.9)]": item.danger,
								"hover:bg-white/5":
									!item.disabled && resolved === "dark",
								"hover:bg-black/5":
									!item.disabled && resolved === "light",
								"opacity-40 cursor-default": item.disabled,
							},
						)}>
						{item.label}
					</button>
				))}
			</div>
		</UIOverlay>
	);
};

export { DashboardContainerMenu };
