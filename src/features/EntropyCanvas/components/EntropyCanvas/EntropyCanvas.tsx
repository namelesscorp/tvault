import { invoke } from "@tauri-apps/api/core";
import { useEffect, useRef, useState } from "react";

const TARGET_BITS = 512;
const BATCH_SIZE = 48;

const EntropyCanvas = ({ onReady }: { onReady: () => void }) => {
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
			<div className="border border-[#3361D8]/50 rounded-[10px] bg-[#3361D8]/10 w-[400px] h-[200px] overflow-hidden">
				<canvas ref={canvasRef} width={400} height={200} />
			</div>
			<div className="w-[320px]">
				<div className="h-[10px] bg-white/10 rounded-[10px]">
					<div
						className="h-[10px] bg-[#3361D8] rounded-[10px] transition-all duration-300 ease"
						style={{
							width: `${(bits / TARGET_BITS) * 100}%`,
						}}></div>
				</div>
			</div>
			<p className="text-[16px] text-white/50 text-medium">
				Generated {bits} / {TARGET_BITS} bits of entropy
			</p>
		</div>
	);
};

export { EntropyCanvas };
