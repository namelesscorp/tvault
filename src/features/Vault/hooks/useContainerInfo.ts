import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect, useState } from "react";
import type { ContainerInfoPayload } from "interfaces";
import { devError, devLog } from "utils";

export type ContainerInfoResult = ContainerInfoPayload;

export function useContainerInfo() {
	const [done, setDone] = useState(false);
	const [result, setResult] = useState<ContainerInfoResult | null>(null);
	const [error, setError] = useState<unknown | null>(null);

	useEffect(() => {
		const unDone = listen<boolean>("info-done", e => {
			devLog("[tvault] info done", e.payload);
			setDone(e.payload);
		});
		const unRes = listen<Record<string, unknown>>("info-result", e => {
			devLog("[tvault] info result", e.payload);
			setResult(e.payload as ContainerInfoResult);
		});
		const unErr = listen<string>("info-error", e => {
			devError("[tvault] info error", e.payload);
			setError(e.payload);
		});
		return () => {
			unDone.then(f => f());
			unRes.then(f => f());
			unErr.then(f => f());
		};
	}, []);

	const run = useCallback(async (path: string) => {
		try {
			setDone(false);
			setResult(null);
			setError(null);
			devLog("[tvault] invoking run_container_info", { path });
			await invoke("run_container_info", { args: { path } });
			devLog("[tvault] run_container_info invoke returned OK");
		} catch (err) {
			devError("[tvault] run_container_info failed", err);
			setError(err);
			throw err;
		}
	}, []);

	return { done, result, error, run };
}
