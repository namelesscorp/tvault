import { Store as TauriStore } from "@tauri-apps/plugin-store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { devLog, useRequestGuard } from "utils";
import { useAppDispatch } from "features/Store";
import { UIContainerRow, UISectionHeading } from "features/UI";
import { useContainerInfo, useVault } from "features/Vault/hooks";
import {
	vaultRemoveRecent,
	vaultSetContainerInfo,
} from "features/Vault/state/Vault.actions";
import {
	selectVaultContainerInfo,
	selectVaultContainers,
	selectVaultRecent,
} from "features/Vault/state/Vault.selectors";
import { icons } from "assets/collections/icons";
import { DashboardContainerInfo } from "../DashboardContainerInfo";

const Dashboard = () => {
	const containers = useSelector(selectVaultContainers);
	const recent = useSelector(selectVaultRecent);
	const dispatch = useAppDispatch();
	const infoMap = useSelector(selectVaultContainerInfo);
	const {
		run: fetchInfo,
		result: infoResult,
		error: infoError,
		done: infoDone,
	} = useContainerInfo();

	const { fn: guardedFetchInfo } = useRequestGuard(fetchInfo);

	const navigate = useNavigate();
	const {
		handleOpenFolder,
		handleCloseContainer,
		handleOpenClosedContainer,
	} = useVault(containerPath => {
		setSelectedContainer(prev =>
			prev && prev.path === containerPath
				? { path: prev.path, mountDir: "" }
				: prev,
		);

		if (containerPath) {
			guardedFetchInfo(containerPath).catch(() => {});
		}
	});
	const [selectedContainer, setSelectedContainer] = useState<{
		path: string;
		mountDir: string;
	} | null>(null);

	const [loadingPaths, setLoadingPaths] = useState<Set<string>>(new Set());
	const loadedRef = useRef<Set<string>>(new Set());

	const selectedResealData = useSelector((state: any) =>
		selectedContainer
			? state.vault.resealData.find(
					(data: any) =>
						data.containerPath === selectedContainer.path,
				)
			: undefined,
	);

	const containerEntries = useMemo(
		() => Object.entries(containers),
		[containers],
	);
	const hasContainers = useMemo(
		() => Object.keys(containers).length > 0 || recent.length > 0,
		[containers],
	);

	const recentClosed = useMemo(() => {
		const openedSet = new Set(Object.keys(containers));
		return recent.filter(r => !openedSet.has(r.path));
	}, [recent, containers]);

	const openContainerDetails = useCallback(
		(idPath: string) => {
			const id = btoa(idPath);
			navigate(`/container/${encodeURIComponent(id)}`);
		},
		[navigate],
	);

	useEffect(() => {
		if (selectedContainer) return;
		const firstOpened = containerEntries[0];
		if (firstOpened) {
			setSelectedContainer({
				path: firstOpened[0],
				mountDir: firstOpened[1],
			});
			return;
		}
		const firstRecent = recentClosed[0];
		if (firstRecent) {
			setSelectedContainer({ path: firstRecent.path, mountDir: "" });
		}
	}, [selectedContainer, containerEntries, recentClosed]);

	useEffect(() => {
		if (!selectedContainer) return;
		const currentMount = containers[selectedContainer.path] || "";
		if (currentMount !== selectedContainer.mountDir) {
			setSelectedContainer({
				path: selectedContainer.path,
				mountDir: currentMount,
			});
		}
	}, [containers, selectedContainer]);

	const decorateTitle = useCallback(
		(path: string) => {
			const cached = infoMap[path];
			const isLoading = loadingPaths.has(path);
			if (isLoading) {
				return `${path} (загрузка...)`;
			}
			return cached?.name || path;
		},
		[infoMap, loadingPaths],
	);
	const candidatePaths = useMemo(() => {
		const opened = Object.keys(containers);
		const recentOnly = recentClosed.map(r => r.path);
		return Array.from(new Set([...opened, ...recentOnly])).filter(
			path => path && path.trim() !== "",
		);
	}, [containers, recentClosed]);

	useEffect(() => {
		const missingPaths = candidatePaths.filter(
			p =>
				!infoMap[p]?.name &&
				!loadedRef.current.has(p) &&
				!loadingPaths.has(p),
		);

		devLog("[Dashboard] candidatePaths:", candidatePaths);
		devLog("[Dashboard] missingPaths:", missingPaths);
		devLog("[Dashboard] loadingPaths:", Array.from(loadingPaths));

		if (missingPaths.length === 0) {
			const allCovered =
				candidatePaths.length > 0 &&
				candidatePaths.every(p => !!infoMap[p]?.name);
			if (allCovered) {
				(async () => {
					try {
						const store = await TauriStore.load(
							"recent-containers.json",
						);
						await store.set("containerInfo", infoMap);
						await store.save();
					} catch {}
				})();
			}
			return;
		}

		const loadNext = async () => {
			const nextPath = missingPaths[0];
			if (!nextPath || nextPath.trim() === "") return;

			setLoadingPaths(prev => new Set(prev).add(nextPath));
			loadedRef.current.add(nextPath);

			try {
				await guardedFetchInfo(nextPath);
			} catch (error) {
				loadedRef.current.delete(nextPath);
				try {
					const errObj = error as any;
					const msg =
						typeof errObj === "string"
							? errObj
							: JSON.stringify(errObj);
					const code =
						typeof errObj === "object" && errObj?.error?.code
							? Number(errObj.error.code)
							: undefined;
					const shouldRemove =
						code === 0x0043 ||
						code === 67 ||
						code === 100 ||
						msg.includes("open container error") ||
						msg.includes("no such file or directory") ||
						msg.includes("E-0043");
					if (shouldRemove) {
						dispatch(vaultRemoveRecent(nextPath));
					}
				} catch {}
			} finally {
				setLoadingPaths(prev => {
					const newSet = new Set(prev);
					newSet.delete(nextPath);
					return newSet;
				});
			}
		};

		loadNext();
	}, [candidatePaths, infoMap, loadingPaths, guardedFetchInfo, dispatch]);

	useEffect(() => {
		if (!selectedContainer?.path) return;

		const path = selectedContainer.path;
		const hasInfo = infoMap[path]?.name;
		const isCurrentlyLoading = loadingPaths.has(path);
		const wasAlreadyTried = loadedRef.current.has(path);

		if (!hasInfo && !isCurrentlyLoading) {
			if (wasAlreadyTried) {
				loadedRef.current.delete(path);
			}

			devLog(
				"[Dashboard] Auto-loading info for selected container:",
				path,
			);
			setLoadingPaths(prev => new Set(prev).add(path));
			loadedRef.current.add(path);

			guardedFetchInfo(path)
				.catch(error => {
					loadedRef.current.delete(path);
					devLog("[Dashboard] Auto-load failed for:", path, error);
					try {
						const errObj = error as any;
						const msg =
							typeof errObj === "string"
								? errObj
								: JSON.stringify(errObj);
						const code =
							typeof errObj === "object" && errObj?.error?.code
								? Number(errObj.error.code)
								: undefined;
						const shouldRemove =
							code === 0x0043 ||
							code === 67 ||
							code === 100 ||
							msg.includes("open container error") ||
							msg.includes("no such file or directory") ||
							msg.includes("E-0043");
						if (shouldRemove) {
							dispatch(vaultRemoveRecent(path));
						}
					} catch {}
				})
				.finally(() => {
					setLoadingPaths(prev => {
						const newSet = new Set(prev);
						newSet.delete(path);
						return newSet;
					});
				});
		}
	}, [
		selectedContainer?.path,
		infoMap,
		loadingPaths,
		guardedFetchInfo,
		dispatch,
	]);

	useEffect(() => {
		if (!infoDone || !infoResult) return;
		const payload = infoResult as any;
		if (payload && payload.path && payload.data) {
			dispatch(
				vaultSetContainerInfo({
					path: payload.path,
					info: payload.data,
				}),
			);
			return;
		}
		if (infoError) {
			try {
				const errObj = infoError as any;
				const msg =
					typeof errObj === "string"
						? errObj
						: JSON.stringify(errObj);
				const pathFromErr =
					typeof errObj === "object" && errObj?.path
						? String(errObj.path)
						: undefined;
				const code =
					typeof errObj === "object" && errObj?.error?.code
						? Number(errObj.error.code)
						: undefined;
				const shouldRemove =
					code === 0x0043 ||
					code === 67 ||
					code === 100 ||
					msg.includes("open container error") ||
					msg.includes("no such file or directory") ||
					msg.includes("E-0043");
				if (shouldRemove && pathFromErr) {
					dispatch(vaultRemoveRecent(pathFromErr));
				}
			} catch {}
		}
	}, [infoDone, infoResult, infoError, dispatch]);

	if (!hasContainers) {
		return (
			<section>
				<p className="text-[20px] text-white/50 text-center">
					Containers not found
				</p>
			</section>
		);
	}

	return (
		<section className="flex flex-col gap-[20px]">
			<UISectionHeading icon={icons.folder} text={"Containers"} />
			<div className="grid grid-cols-2 gap-[20px] items-start">
				<div className="flex flex-col gap-[12px] col-span-1 max-h-[660px] overflow-y-auto pb-[20px] pr-[1px]">
					{containerEntries.map(([containerPath, mountDir]) => (
						<UIContainerRow
							key={containerPath}
							text={decorateTitle(containerPath)}
							active={selectedContainer?.path === containerPath}
							onDoubleClick={() =>
								openContainerDetails(containerPath)
							}
							onClick={() =>
								setSelectedContainer({
									path: containerPath,
									mountDir,
								})
							}
						/>
					))}
					{recentClosed.map(r => (
						<UIContainerRow
							key={r.path}
							text={decorateTitle(r.path)}
							active={selectedContainer?.path === r.path}
							onDoubleClick={() => openContainerDetails(r.path)}
							onClick={() =>
								setSelectedContainer({
									path: r.path,
									mountDir: "",
								})
							}
						/>
					))}
					{loadingPaths.size > 0 && (
						<div className="flex items-center justify-center py-[10px] text-white/50 text-sm">
							Loading info about containers... (
							{loadingPaths.size} left)
						</div>
					)}
				</div>
				<DashboardContainerInfo
					path={selectedContainer?.path || ""}
					mountDir={selectedContainer?.mountDir || ""}
					isOpened={!!selectedContainer?.mountDir}
					info={
						selectedContainer
							? infoMap[selectedContainer.path]
							: undefined
					}
					savedMountPath={
						selectedContainer
							? recent.find(
									r => r.path === selectedContainer.path,
								)?.lastMountPath
							: undefined
					}
					onOpenFolder={() =>
						handleOpenFolder(selectedContainer?.mountDir ?? "")
					}
					onClose={updatedResealData =>
						handleCloseContainer(
							selectedContainer?.path ?? "",
							selectedContainer?.mountDir ?? "",
							updatedResealData || selectedResealData,
						)
					}
					onOpenClosed={() => {
						const path = selectedContainer?.path;
						if (!path) return;
						handleOpenClosedContainer(path);
					}}
					icons={{
						folder: icons.folder,
						lock: icons.lock,
						pencil: icons.lock,
						check: icons.check,
						close: icons.close,
						settings: icons.settings,
					}}
				/>
			</div>
		</section>
	);
};

export { Dashboard };
