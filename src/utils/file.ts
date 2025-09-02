import { invoke } from "@tauri-apps/api/core";
import { openPath } from "@tauri-apps/plugin-opener";
import { toast } from "react-toastify";
import { devError } from "./log";

export const openPathUniversal = async (targetPath: string) => {
	try {
		await invoke("open_path_native", { path: targetPath });
		return;
	} catch (e1) {
		devError("open_path_native failed:", e1);
	}

	try {
		await openPath(targetPath);
	} catch (e2) {
		devError("openPath plugin fallback failed:", e2);
		toast.error(
			`Failed to open file: ${String((e2 as any)?.message ?? e2)}`,
		);
	}
};
