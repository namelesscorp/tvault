import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { RouteTypes } from "interfaces";
import { devLog } from "utils";
import { useAppDispatch } from "features/Store";
import {
	cleanupNonExistentContainers,
	isContainerAccessible,
	vaultScanContainersDirectory,
} from "../state/Vault.actions";
import { vaultRemoveRecent } from "../state/Vault.actions";
import {
	selectVaultContainersPath,
	selectVaultRecent,
} from "../state/Vault.selectors";

export const useBackgroundContainerScan = () => {
	const location = useLocation();
	const dispatch = useAppDispatch();
	const containersPath = useSelector(selectVaultContainersPath);
	const recent = useSelector(selectVaultRecent);
	const isScanningRef = useRef(false);
	const lastScanTimeRef = useRef<number>(0);
	const SCAN_COOLDOWN = 5000;

	useEffect(() => {
		if (location.pathname !== RouteTypes.Dashboard) {
			return;
		}

		const now = Date.now();
		if (
			isScanningRef.current ||
			now - lastScanTimeRef.current < SCAN_COOLDOWN
		) {
			return;
		}

		if (!containersPath) {
			devLog("[BackgroundScan] No containers path set, skipping scan");
			return;
		}

		isScanningRef.current = true;
		lastScanTimeRef.current = now;

		devLog("[BackgroundScan] Starting background container scan");

		const performBackgroundScan = async () => {
			try {
				await cleanupNonExistentContainers(dispatch);

				await dispatch(vaultScanContainersDirectory(containersPath));

				if (recent.length > 0) {
					devLog(
						"[BackgroundScan] Checking accessibility of",
						recent.length,
						"containers",
					);

					const checkPromises = recent.map(async container => {
						try {
							const isAccessible = await isContainerAccessible(
								container.path,
							);
							if (!isAccessible) {
								devLog(
									"[BackgroundScan] Container not accessible, removing:",
									container.path,
								);
								dispatch(vaultRemoveRecent(container.path));
							}
						} catch (error) {
							devLog(
								"[BackgroundScan] Error checking container accessibility:",
								container.path,
								error,
							);
						}
					});

					Promise.allSettled(checkPromises).then(() => {
						devLog(
							"[BackgroundScan] Background accessibility check completed",
						);
					});
				}

				devLog(
					"[BackgroundScan] Background scan completed successfully",
				);
			} catch (error) {
				devLog("[BackgroundScan] Background scan failed:", error);
			} finally {
				isScanningRef.current = false;
			}
		};

		performBackgroundScan();
	}, [location.pathname, containersPath, recent, dispatch]);
};
