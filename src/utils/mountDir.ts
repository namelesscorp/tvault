import { join, tempDir } from "@tauri-apps/api/path";
import { exists } from "@tauri-apps/plugin-fs";

export async function makeMountDir(containerPath: string): Promise<string> {
	try {
		const tmp = await tempDir();
		return await join(tmp, `tvault_mount_${crypto.randomUUID()}`);
	} catch {
		return `${containerPath}.mount_${crypto.randomUUID()}`;
	}
}

export async function tryUseSavedMountPath(
	savedPath: string,
): Promise<string | null> {
	try {
		const pathExists = await exists(savedPath);
		if (pathExists) {
			return savedPath;
		}

		return null;
	} catch {
		return null;
	}
}

export async function getMountPathWithFallback(
	savedPath?: string,
	containerPath?: string,
): Promise<string> {
	if (savedPath) {
		const result = await tryUseSavedMountPath(savedPath);
		if (result) {
			return result;
		}
	}

	return await makeMountDir(containerPath || "");
}
