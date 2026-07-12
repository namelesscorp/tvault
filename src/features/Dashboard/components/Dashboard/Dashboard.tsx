import { Store as TauriStore } from "@tauri-apps/plugin-store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { getContainerName } from "../../Dashboard.utils";
import {
	cn,
	devLog,
	extractErrorMessage,
	shouldRemoveContainerOnError,
	useRequestGuard,
} from "utils";
import { Filters } from "features/Filters";
import {
	selectFiltersFilterType,
	selectFiltersSearchValue,
} from "features/Filters/state/Filters.selectors";
import { ModalTypes } from "features/Modal/Modal.model";
import {
	modalSetIcon,
	modalSetOpen,
	modalSetPayload,
	modalSetTitle,
	modalSetType,
} from "features/Modal/state/Modal.actions";
import { Stats } from "features/Stats";
import { useAppDispatch } from "features/Store";
import { useContainerInfo, useVault } from "features/Vault/hooks";
import {
	vaultRemoveRecentContainer,
	vaultSetContainerInfo,
} from "features/Vault/state/Vault.actions";
import { isContainerAccessible } from "features/Vault/state/Vault.actions";
import {
	selectVaultContainerInfo,
	selectVaultContainers,
	selectVaultRecent,
	selectVaultResealData,
} from "features/Vault/state/Vault.selectors";
import { icons } from "assets/collections/icons";
import { DashboardContainerItem } from "../DashboardContainerItem";
import { DashboardEmpty } from "../DashboardEmpty";

const Dashboard = () => {
	const { formatMessage } = useIntl();
	const containers = useSelector(selectVaultContainers);
	const recent = useSelector(selectVaultRecent);
	const dispatch = useAppDispatch();
	const infoMap = useSelector(selectVaultContainerInfo);
	const searchValue = useSelector(selectFiltersSearchValue);
	const filterType = useSelector(selectFiltersFilterType);
	const {
		run: fetchInfo,
		result: infoResult,
		error: infoError,
		done: infoDone,
	} = useContainerInfo();

	const { fn: guardedFetchInfo } = useRequestGuard(fetchInfo);

	const {
		handleOpenFolder,
		handleCloseContainer,
		handleOpenClosedContainer,
		closingPath,
		closingProgress,
	} = useVault(containerPath => {
		if (containerPath) {
			guardedFetchInfo(containerPath).catch(() => {});
		}
	});

	const [loadingPaths, setLoadingPaths] = useState<Set<string>>(new Set());
	const loadedRef = useRef<Set<string>>(new Set());

	useEffect(() => {
		return () => {
			loadedRef.current.clear();
			setLoadingPaths(new Set());
		};
	}, []);

	const resealData = useSelector(selectVaultResealData);

	const containerEntries = useMemo(
		() => Object.entries(containers),
		[containers],
	);
	const hasContainers = useMemo(
		() => Object.keys(containers).length > 0 || recent.length > 0,
		[containers, recent],
	);

	const recentClosed = useMemo(() => {
		const openedSet = new Set(Object.keys(containers));
		return recent.filter(r => !openedSet.has(r.path));
	}, [recent, containers]);

	/** Opened containers first, then the ones that are known but locked. */
	const allContainers = useMemo(
		() => [
			...containerEntries.map(([path, mountDir]) => ({
				path,
				mountDir,
				isOpened: true,
			})),
			...recentClosed.map(r => ({
				path: r.path,
				mountDir: "",
				isOpened: false,
			})),
		],
		[containerEntries, recentClosed],
	);

	const visibleContainers = useMemo(() => {
		const query = searchValue.trim().toLowerCase();

		return allContainers.filter(item => {
			if (filterType === "locked" && item.isOpened) return false;
			if (filterType === "unlocked" && !item.isOpened) return false;
			if (!query) return true;

			const info = infoMap[item.path];
			const haystack = [
				getContainerName(item.path, info),
				item.path,
				...(info?.tags ?? []),
			]
				.join(" ")
				.toLowerCase();

			return haystack.includes(query);
		});
	}, [allContainers, filterType, infoMap, searchValue]);

	const openContainerModal = useCallback(
		(
			containerPath: string,
			type: ModalTypes,
			titleId: string,
			icon: string,
		) => {
			dispatch(modalSetPayload(containerPath));
			dispatch(modalSetType(type));
			dispatch(modalSetTitle(formatMessage({ id: titleId })));
			dispatch(modalSetIcon(icon));
			dispatch(modalSetOpen(true));
		},
		[dispatch, formatMessage],
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

			if (loadingPaths.has(nextPath) || loadedRef.current.has(nextPath)) {
				return;
			}

			setLoadingPaths(prev => new Set(prev).add(nextPath));
			loadedRef.current.add(nextPath);

			try {
				const isAccessible = await isContainerAccessible(nextPath);
				if (!isAccessible) {
					devLog(
						"[Dashboard] Container not accessible, removing:",
						nextPath,
					);
					dispatch(vaultRemoveRecentContainer(nextPath));
					return;
				}

				await guardedFetchInfo(nextPath);
			} catch (error) {
				loadedRef.current.delete(nextPath);
				try {
					devLog(
						"[Dashboard] Container info error:",
						extractErrorMessage(error),
					);
					if (shouldRemoveContainerOnError(error)) {
						dispatch(vaultRemoveRecentContainer(nextPath));
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
	}, [candidatePaths, infoMap, guardedFetchInfo, dispatch]);

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
				devLog(
					"[Dashboard] Container info error:",
					extractErrorMessage(infoError),
				);
				const pathFromErr =
					typeof infoError === "object" &&
					infoError !== null &&
					"path" in infoError
						? String((infoError as any).path)
						: undefined;
				if (shouldRemoveContainerOnError(infoError) && pathFromErr) {
					dispatch(vaultRemoveRecentContainer(pathFromErr));
				}
			} catch {}
		}
	}, [infoDone, infoResult, infoError, dispatch]);

	return (
		<section className="flex flex-col h-full min-h-0 px-[40px]">
			<div className="py-[20px]">
				<Stats />
			</div>
			<div className="pb-[10px]">
				<Filters />
			</div>
			{!hasContainers && (
				<DashboardEmpty
					title="dashboard.empty.title"
					description="dashboard.empty.description"
				/>
			)}
			{visibleContainers.length > 0 && (
				<div className="grid gap-[20px] grid-cols-3 auto-rows-min flex-1 min-h-0 pt-[10px] pb-[35px] overflow-y-auto scrollbar-hide">
					{visibleContainers.map((item, index) => (
						<DashboardContainerItem
							key={item.path}
							path={item.path}
							index={index}
							info={infoMap[item.path]}
							isOpened={item.isOpened}
							lastOpenedAt={
								recent.find(r => r.path === item.path)
									?.lastOpenedAt
							}
							closing={closingPath === item.path}
							closingProgress={closingProgress}
							onBrowse={() => handleOpenFolder(item.mountDir)}
							onLock={() =>
								handleCloseContainer(
									item.path,
									item.mountDir,
									resealData.find(
										d => d.containerPath === item.path,
									),
								)
							}
							onUnlock={() =>
								handleOpenClosedContainer(item.path)
							}
							onEdit={() =>
								openContainerModal(
									item.path,
									ModalTypes.EDIT,
									"container.edit.title",
									icons.pencil,
								)
							}
							onInfo={() =>
								openContainerModal(
									item.path,
									ModalTypes.INFO,
									"container.info.title",
									icons.book_open,
								)
							}
							onRemove={() =>
								dispatch(vaultRemoveRecentContainer(item.path))
							}
							onDelete={() =>
								openContainerModal(
									item.path,
									ModalTypes.DELETE,
									"container.delete.title",
									icons.annotation_alert,
								)
							}
						/>
					))}
				</div>
			)}
			{hasContainers && visibleContainers.length === 0 && (
				<DashboardEmpty
					title="dashboard.notFound"
					description="dashboard.notFoundDescription"
				/>
			)}
			{loadingPaths.size > 0 && (
				<div
					className={cn(
						"flex items-center justify-center py-[10px] text-sm text-faint",
					)}>
					{formatMessage(
						{ id: "dashboard.loading" },
						{ count: loadingPaths.size },
					)}
				</div>
			)}
		</section>
	);
};

export { Dashboard };
