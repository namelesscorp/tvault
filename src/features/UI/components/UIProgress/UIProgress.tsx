import { useIntl } from "react-intl";

/** Driven by the `PROGRESS <n>` lines the core prints during seal/unseal/reseal. */
const UIProgress = ({
	value,
	label = true,
	className,
}: {
	value: number;
	label?: boolean;
	className?: string;
}) => {
	const { formatMessage } = useIntl();
	const percent = Math.max(0, Math.min(100, Math.round(value)));

	return (
		<div className={className}>
			<div className="h-[10px] rounded-[10px] overflow-hidden bg-track">
				<div
					className="relative h-full rounded-[10px] overflow-hidden bg-accent-blue transition-all duration-300 ease-out"
					style={{ width: `${percent}%` }}>
					{/** A highlight sweeps the filled part, so a slow step still looks alive. */}
					{percent > 0 && percent < 100 && (
						<span className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
					)}
				</div>
			</div>
			{label && (
				<p className="mt-[10px] text-center text-[14px] font-medium tracking-[-0.05em] text-muted">
					{formatMessage({ id: "common.progress" })}: {percent}%
				</p>
			)}
		</div>
	);
};

export { UIProgress };
