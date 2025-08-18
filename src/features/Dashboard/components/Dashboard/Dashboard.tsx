import { Store as TauriStore } from "@tauri-apps/plugin-store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
	const navigate = useNavigate();
	const {
		handleOpenFolder,
		handleCloseContainer,
		handleOpenClosedContainer,
		handleEditContainer,
	} = useVault(containerPath => {
		setSelectedContainer(prev =>
			prev && prev.path === containerPath
				? { path: prev.path, mountDir: "" }
				: prev,
		);
	});
	const [selectedContainer, setSelectedContainer] = useState<{
		path: string;
		mountDir: string;
	} | null>(null);

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
			return cached?.name || path;
		},
		[infoMap],
	);

	const [infoLoadingPath, setInfoLoadingPath] = useState<string | null>(null);
	const loadedRef = useRef<Set<string>>(new Set());
	const candidatePaths = useMemo(() => {
		const opened = Object.keys(containers);
		const recentOnly = recentClosed.map(r => r.path);
		return Array.from(new Set([...opened, ...recentOnly]));
	}, [containers, recentClosed]);

	useEffect(() => {
		if (infoLoadingPath) {
			return;
		}

		const nextMissing = candidatePaths.find(
			p => !infoMap[p]?.name && !loadedRef.current.has(p),
		);

		if (nextMissing) {
			setInfoLoadingPath(nextMissing);
			loadedRef.current.add(nextMissing);
			fetchInfo(nextMissing).catch(() => {});
		}

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
	}, [candidatePaths, infoMap, infoLoadingPath, fetchInfo]);

	useEffect(() => {
		if (!infoLoadingPath || !infoDone) return;
		const payload = infoResult as any;
		if (payload && payload.path === infoLoadingPath && payload.data) {
			dispatch(
				vaultSetContainerInfo({
					path: payload.path,
					info: payload.data,
				}),
			);
			setInfoLoadingPath(null);
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
						: infoLoadingPath;
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
			setInfoLoadingPath(null);
		}
	}, [infoDone, infoResult, infoError, infoLoadingPath, dispatch]);

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
					onClose={() =>
						handleCloseContainer(
							selectedContainer?.path ?? "",
							selectedContainer?.mountDir ?? "",
						)
					}
					onOpenClosed={() => {
						const path = selectedContainer?.path;
						if (!path) return;
						handleOpenClosedContainer(path);
					}}
					onEdit={handleEditContainer}
					icons={{
						folder: icons.folder,
						lock: icons.lock,
						pencil: icons.lock,
					}}
				/>
			</div>
		</section>
	);
};

export { Dashboard };
