import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef, useState } from "react";
import { devError, devLog, extractErrorMessage } from "utils";

export interface DecryptArgs {
	containerPath: string;
	folderPath: string;
	passphrase?: string;
	masterToken?: string;
	tokenReaderType?: "flag" | "file";
	tokenFormat?: "json" | "plaintext";
	tokenFlag?: string;
	tokenPath?: string;
	additionalPassword?: string;
}

const useDecrypt = () => {
	const [progress, setProgress] = useState(0);
	const [done, setDone] = useState(false);
	const [error, setError] = useState<unknown | null>(null);
	const runningRef = useRef(false);

	useEffect(() => {
		const un1 = listen<number>("decrypt-progress", e => {
			devLog("[tvault] decrypt progress", e.payload);
			setProgress(e.payload);
		});
		const un2 = listen<boolean>("decrypt-done", e => {
			devLog("[tvault] decrypt done", e.payload);
			setDone(e.payload);
			if (e.payload) {
				runningRef.current = false;
			}
		});

		return () => {
			un1.then(f => f());
			un2.then(f => f());
		};
	}, []);

	const run = async (args: DecryptArgs) => {
		if (runningRef.current) {
			devLog("[tvault] decrypt already running, skipping");
			return;
		}

		runningRef.current = true;
		setProgress(0);
		setDone(false);
		setError(null);

		const payload: Record<string, unknown> = {
			container_path: args.containerPath,
			folder_path: args.folderPath,
		};

		if (args.additionalPassword) {
			payload.additional_password = args.additionalPassword;
		}

		if (args.passphrase) {
			payload.token = args.passphrase;
			if (args.masterToken) {
				payload.master_token = args.masterToken;
			}
		} else if (args.tokenReaderType) {
			payload.token_reader_type = args.tokenReaderType;
			payload.token_format = args.tokenFormat ?? "json";
			if (args.tokenReaderType === "flag") {
				if (args.tokenFlag) {
					payload.token_flag = args.tokenFlag;
				}
			} else if (args.tokenReaderType === "file") {
				if (args.tokenPath) {
					payload.token_path = args.tokenPath;
				}
			}
		}
		devLog("[tvault] invoking run_decrypt with", payload);
		try {
			await invoke("run_decrypt", { args: payload });
			devLog("[tvault] run_decrypt invoke returned OK");
		} catch (err) {
			devError("[tvault] run_decrypt failed", extractErrorMessage(err));
			setError(err);
			runningRef.current = false;
			throw err;
		}
	};

	return { progress, done, error, run };
};

export { useDecrypt };
