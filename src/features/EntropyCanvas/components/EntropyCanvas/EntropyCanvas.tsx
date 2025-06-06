import { Box, Flex, Progress, Text } from "@radix-ui/themes";
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
		ctx.strokeStyle = "#3e63dd";
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

	/* ───────────────────────  UI  ─────────────────────── */
	return (
		<Flex direction="column" align="center" gap="4">
			{/* Canvas-область */}
			<Box
				style={{
					border: `1px solid var(--gray-6)`,
					borderRadius: "var(--radius-4)",
					backgroundColor: "var(--gray-2)",
					width: 300,
					height: 300,
					overflow: "hidden",
				}}>
				<canvas ref={canvasRef} width={300} height={300} />
			</Box>

			{/* Прогресс-бар */}
			<Progress
				value={bits}
				max={TARGET_BITS}
				style={{ width: 320 }}
				radius="large"
				size="2"
			/>

			{/* Подпись */}
			<Text size="2" color="gray">
				Сгенерировано {bits} / {TARGET_BITS} бит случайности
			</Text>
		</Flex>
	);
};

export { EntropyCanvas };
