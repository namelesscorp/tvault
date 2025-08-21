import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef, useState } from "react";
import { devError, devLog } from "utils";
import type { VaultWizardState } from "../Vault.model";

const useEncrypt = (wizardState: VaultWizardState) => {
	const [progress, setProgress] = useState(0);
	const [done, setDone] = useState(false);
	const [result, setResult] = useState<Record<string, unknown> | null>(null);
	const [error, setError] = useState<unknown | null>(null);
	const runningRef = useRef(false);

	useEffect(() => {
		const un1 = listen<number>("encrypt-progress", e => {
			devLog("[tvault] progress", e.payload);
			setProgress(e.payload);
		});
		const un2 = listen<boolean>("encrypt-done", e => {
			devLog("[tvault] done", e.payload);
			setDone(e.payload);
			if (e.payload) {
				runningRef.current = false;
			}
		});
		const un3 = listen<Record<string, unknown>>("encrypt-result", e => {
			console.log("[tvault] encrypt-result:", e.payload);
			devLog("[tvault] result", e.payload);
			setResult(e.payload as Record<string, unknown>);
		});
		const un4 = listen<string>("encrypt-error", e => {
			devError("[tvault] stderr", e.payload);
			setError(e.payload);
		});
		const un5 = listen<string>("encrypt-stdout", e => {
			console.log("[tvault] stdout:", e.payload);
		});
		return () => {
			un1.then(f => f());
			un2.then(f => f());
			un3.then(f => f());
			un4.then(f => f());
			un5.then(f => f());
		};
	}, []);

	const run = async () => {
		if (runningRef.current) {
			devLog("[tvault] encrypt already running, skipping");
			return;
		}

		runningRef.current = true;
		setProgress(0);
		setDone(false);
		setError(null);
		setResult(null);

		const args = {
			name: wizardState.name || undefined,
			container_path: wizardState.outputPath,
			folder_path: wizardState.inputPath,
			compression_type: wizardState.compression,
			passphrase: wizardState.passphrase,
			token_type: wizardState.tokenType || "share",
			token_save_type: wizardState.shareDest,
			token_save_path: wizardState.sharePath,
			is_shamir_enabled: wizardState.split,
			number_of_shares: wizardState.n,
			threshold: wizardState.k,
			integrity_provider: wizardState.integrityProvider ?? "none",
			additional_password:
				wizardState.integrityProvider === "hmac"
					? wizardState.additionalPassword
					: undefined,
			comment: wizardState.comment || undefined,
			tags: wizardState.tags || undefined,
		};
		devLog("[tvault] invoking run_encrypt with", args);
		devLog("[tvault] comment:", wizardState.comment);
		devLog("[tvault] tags:", wizardState.tags);

		try {
			await invoke("run_encrypt", { args });
			devLog("[tvault] invoke returned OK");
		} catch (err) {
			devError("[tvault] invoke failed", err);
			setError(err);
			runningRef.current = false;
			throw err;
		}
	};

	const normalized = (() => {
		if (!result)
			return null as null | { masterToken?: string; shares?: string[] };
		const obj = result as Record<string, unknown>;
		const masterToken = (obj["master_token"] as string) || undefined;
		const tokenList = (obj["token_list"] as string[]) || undefined;
		const shareList =
			(obj["share_list"] as Record<string, string>) || undefined;
		const shares =
			tokenList ?? (shareList ? Object.values(shareList) : undefined);

		return { masterToken, shares };
	})();

	return { progress, done, result: normalized, error, run };
};

export { useEncrypt };
