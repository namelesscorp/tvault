import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef, useState } from "react";
import { devError, devLog, extractErrorMessage } from "utils";

export interface ResealArgs {
	currentPath: string;
	newPath?: string;
	folderPath: string;
	name?: string;
	passphrase?: string;
	comment?: string;
	tags?: string;
	integrityProvider?: string;
	currentIntegrityPassword?: string;
	newIntegrityPassword?: string;
	masterToken?: string;
	shares?: string[];
	tokenType?: string;
	tokenJsonPath?: string;
}

const useReseal = () => {
	const [progress, setProgress] = useState(0);
	const [done, setDone] = useState(false);
	const [error, setError] = useState<unknown | null>(null);
	const [result, setResult] = useState<unknown | null>(null);
	const runningRef = useRef(false);

	useEffect(() => {
		const un1 = listen<number>("reseal-progress", e => {
			devLog("[tvault] reseal progress", e.payload);
			setProgress(e.payload);
		});
		const un2 = listen<boolean>("reseal-done", e => {
			devLog("[tvault] reseal done", e.payload);
			setDone(e.payload);
			if (e.payload) {
				runningRef.current = false;
			}
		});
		const un3 = listen<unknown>("reseal-result", e => {
			devLog("[tvault] reseal result", e.payload);
			setResult(e.payload);
		});
		const un4 = listen<unknown>("reseal-error", e => {
			devLog("[tvault] reseal error", extractErrorMessage(e.payload));
			setError(e.payload);
		});

		return () => {
			un1.then(f => f());
			un2.then(f => f());
			un3.then(f => f());
			un4.then(f => f());
		};
	}, []);

	const run = async (args: ResealArgs) => {
		if (runningRef.current) {
			devLog("[tvault] reseal already running, skipping");
			return;
		}

		runningRef.current = true;
		setProgress(0);
		setDone(false);
		setError(null);
		setResult(null);

		const payload: Record<string, unknown> = {
			current_path: args.currentPath,
			folder_path: args.folderPath,
		};

		if (args.newPath) {
			payload.new_path = args.newPath;
		}
		if (args.name) {
			payload.name = args.name;
		}
		if (args.passphrase) {
			payload.passphrase = args.passphrase;
		}
		if (args.comment) {
			payload.comment = args.comment;
		}
		if (args.tags) {
			payload.tags = args.tags;
		}
		if (args.integrityProvider) {
			payload.integrity_provider = args.integrityProvider;
		}
		if (args.currentIntegrityPassword) {
			payload.current_integrity_password = args.currentIntegrityPassword;
		}
		if (args.newIntegrityPassword) {
			payload.new_integrity_password = args.newIntegrityPassword;
		}
		if (args.masterToken) {
			payload.master_token = args.masterToken;
		}
		if (args.shares) {
			payload.shares = args.shares;
		}
		if (args.tokenType) {
			payload.token_type = args.tokenType;
		}
		if (args.tokenJsonPath) {
			payload.token_json_path = args.tokenJsonPath;
		}

		devLog("[tvault] invoking run_reseal with", payload);
		devLog(
			"[tvault] reseal command args:",
			JSON.stringify(payload, null, 2),
		);

		try {
			const resealPromise = new Promise<void>((resolve, reject) => {
				const un1 = listen<boolean>("reseal-done", e => {
					devLog("[tvault] reseal-done event received:", e.payload);
					if (e.payload) {
						resolve();
					} else {
						reject(new Error("Reseal operation failed"));
					}
				});

				const un2 = listen<unknown>("reseal-error", e => {
					devLog("[tvault] reseal-error event received:", e.payload);
					reject(e.payload);
				});

				setTimeout(
					() => {
						un1.then(f => f());
						un2.then(f => f());
						reject(new Error("Reseal operation timeout"));
					},
					5 * 60 * 1000,
				);
			});

			await invoke("run_reseal", { args: payload });
			devLog("[tvault] run_reseal invoke returned OK");

			await resealPromise;
			devLog("[tvault] reseal operation completed successfully");
		} catch (err) {
			devError("[tvault] run_reseal failed", extractErrorMessage(err));
			setError(err);
			runningRef.current = false;
			throw err;
		}
	};

	return { progress, done, error, result, run };
};

export { useReseal };
