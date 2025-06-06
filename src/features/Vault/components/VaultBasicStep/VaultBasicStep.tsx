/* Radix Themes */
import { Box, Button, Callout, Flex, Text, TextField } from "@radix-ui/themes";
import { invoke } from "@tauri-apps/api/core";
import { join } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { useState } from "react";
import { z } from "zod";

const schema = z.object({
	name: z.string().min(1, "Введите имя"),
	path: z.string().min(1, "Выберите путь"),
});

const VaultBasicStep = ({
	onNext,
}: {
	onNext: (data: { name: string; path: string }) => void;
}) => {
	const [name, setName] = useState("");
	const [path, setPath] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	/* выбор директории */
	const pickDir = async () => {
		const dir = await open({ directory: true, multiple: false });
		if (typeof dir !== "string") return;
		const safe = (name || "vault").replace(/[^a-z0-9_-]/gi, "_");
		setPath(await join(dir, `${safe}.tvlt`));
	};

	const next = async () => {
		const parsed = schema.safeParse({ name, path });
		if (!parsed.success) return setError(parsed.error.issues[0].message);
		setBusy(true);
		try {
			await invoke("check_container_path", { path });
			onNext({ name, path });
		} catch (e: any) {
			setError(String(e));
		} finally {
			setBusy(false);
		}
	};

	return (
		<Box width="360px">
			<Text as="label" size="2" weight="medium">
				Имя контейнера
			</Text>
			<TextField.Root
				value={name}
				onChange={e => setName(e.target.value)}
				mt="1"
				mb="3"
				placeholder="Project Docs"
			/>

			<Text as="label" size="2" weight="medium">
				Папка для контейнера
			</Text>
			<Flex gap="2" mt="1" mb="4">
				<TextField.Root
					readOnly
					value={path}
					placeholder="Не выбрана"
					style={{ flex: 1 }}
				/>
				<Button size="2" onClick={pickDir}>
					Обзор…
				</Button>
			</Flex>

			{error && (
				<Callout.Root color="red" mb="3">
					<Callout.Text>{error}</Callout.Text>
				</Callout.Root>
			)}

			<Flex justify="end">
				<Button
					onClick={next}
					disabled={busy}
					variant="solid"
					color="indigo">
					Далее →
				</Button>
			</Flex>
		</Box>
	);
};

export { VaultBasicStep };
