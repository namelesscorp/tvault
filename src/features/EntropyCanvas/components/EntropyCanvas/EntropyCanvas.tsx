import { invoke } from "@tauri-apps/api/core";
import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { cn } from "utils";
import { useTheme } from "features/Theme";

const TARGET_BITS = 512;
const BATCH_SIZE = 48;

const EntropyCanvas = ({
	onReady,
	width = 400,
	height = 200,
}: {
	onReady: () => void;
	width?: number;
	height?: number;
}) => {
	const { formatMessage } = useIntl();
	const { resolved } = useTheme();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [bits, setBits] = useState(0);
	const buffer = useRef<number[]>([]);

	/* ─────────────────────  Mouse-tracking  ───────────────────── */
	useEffect(() => {
		const ctx = canvasRef.current?.getContext("2d");
		if (!ctx) return;

		ctx.lineCap = "round";
		ctx.lineWidth = 2;
		ctx.strokeStyle = "#3361D8";
		let last: [number, number] | null = null;

		const onMove = (e: MouseEvent) => {
			if (!canvasRef.current) return;
			const rect = canvasRef.current.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			if (last) {
				ctx.beginPath();
				ctx.moveTo(...last);
				ctx.lineTo(x, y);
				ctx.stroke();
			}
			last = [x, y];

			buffer.current.push(x & 0xff, y & 0xff, Date.now() & 0xff);
			if (buffer.current.length >= BATCH_SIZE) flushBatch();
		};

		const flushBatch = async () => {
			const totalBits: number = await invoke("entropy_batch", {
				bytes: [...buffer.current],
			});
			buffer.current = [];
			setBits(totalBits);
			if (totalBits >= TARGET_BITS) onReady();
		};

		canvasRef.current?.addEventListener("mousemove", onMove);
		return () =>
			canvasRef.current?.removeEventListener("mousemove", onMove);
	}, [onReady]);

	return (
		<div className="flex flex-col items-center gap-[20px]">
			<div
				className="border border-[#3361D8]/50 rounded-[10px] bg-[#3361D8]/10 overflow-hidden"
				style={{ width, height }}>
				<canvas ref={canvasRef} width={width} height={height} />
			</div>
			<div style={{ width }}>
				<div
					className={cn("h-[10px] rounded-[10px]", {
						"bg-white/10": resolved === "dark",
						"bg-black/10": resolved === "light",
					})}>
					<div
						className="h-[10px] bg-[#3361D8] rounded-[10px] transition-all duration-300 ease"
						style={{
							width: `${(bits / TARGET_BITS) * 100}%`,
						}}></div>
				</div>
			</div>
			<p className={cn("text-[16px] font-medium text-faint")}>
				{formatMessage(
					{ id: "entropy.generated" },
					{ count: bits, total: TARGET_BITS },
				)}
			</p>
		</div>
	);
};

export { EntropyCanvas };
