import { relaunch } from "@tauri-apps/plugin-process";
import { Update, check } from "@tauri-apps/plugin-updater";
import { useCallback, useEffect, useRef } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { devError, devInfo } from "utils";
import { useAutoUpdate } from "features/App";
import { selectVaultContainers } from "features/Vault/state/Vault.selectors";

/** Late enough that the update check does not compete with the app's own startup. */
const START_DELAY = 15_000;
const CHECK_INTERVAL = 6 * 60 * 60 * 1000;

/**
 * Checks for a release in the background, downloads it, and then asks to restart.
 *
 * It deliberately stops short of restarting on its own. Installing means relaunching
 * the app, and an open container is a real folder mounted on disk with the user's
 * files in it — pulling the process out from under that would strand the mount and
 * lose whatever had not been sealed back yet. So the last step is always the user's.
 */
export const useBackgroundUpdater = () => {
	const { formatMessage } = useIntl();
	const { enabled } = useAutoUpdate();

	/** Path -> mount dir of every currently unlocked container. */
	const openContainers = useSelector(selectVaultContainers);
	const openContainersRef = useRef(openContainers);
	openContainersRef.current = openContainers;

	const updateRef = useRef<Update | null>(null);
	const busyRef = useRef(false);
	/** One prompt per launch: nagging every six hours would be worse than useless. */
	const promptedRef = useRef(false);

	const install = useCallback(async () => {
		if (Object.keys(openContainersRef.current).length > 0) {
			toast.warn(formatMessage({ id: "update.restart.locked" }));
			return;
		}

		try {
			await updateRef.current?.install();
			await relaunch();
		} catch (e) {
			devError("Failed to install the update", e);
			toast.error(formatMessage({ id: "update.error" }));
		}
	}, [formatMessage]);

	const run = useCallback(async () => {
		if (busyRef.current || promptedRef.current) {
			return;
		}
		busyRef.current = true;

		try {
			const update = await check();
			if (!update) {
				devInfo("No update available");
				return;
			}

			devInfo("Downloading update:", update.version);
			await update.download();
			updateRef.current = update;
			promptedRef.current = true;

			toast.info(
				({ closeToast }) => (
					<div className="flex flex-col gap-[10px]">
						<span>
							{formatMessage(
								{ id: "update.ready" },
								{ version: update.version },
							)}
						</span>
						<button
							type="button"
							onClick={() => {
								closeToast();
								install();
							}}
							className="self-start px-[10px] py-[4px] rounded-[6px] bg-accent-blue text-white text-[14px] font-medium cursor-pointer press">
							{formatMessage({ id: "update.restart" })}
						</button>
					</div>
				),
				{ autoClose: false, closeOnClick: false },
			);
		} catch (e) {
			/** A background task stays quiet: the manual check in settings reports errors. */
			devError("Background update check failed", e);
		} finally {
			busyRef.current = false;
		}
	}, [formatMessage, install]);

	useEffect(() => {
		if (!enabled) {
			return;
		}

		const first = setTimeout(run, START_DELAY);
		const interval = setInterval(run, CHECK_INTERVAL);

		return () => {
			clearTimeout(first);
			clearInterval(interval);
		};
	}, [enabled, run]);
};
