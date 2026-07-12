import { useCallback } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "features/Store";
import { appChangeAutoUpdate } from "../state/App.actions";
import { selectAppAutoUpdate } from "../state/App.selectors";

/** The Settings › Updates preference. The work itself lives in useBackgroundUpdater. */
export const useAutoUpdate = () => {
	const dispatch = useAppDispatch();
	const enabled = useSelector(selectAppAutoUpdate);

	const setEnabled = useCallback(
		(next: boolean) => {
			dispatch(appChangeAutoUpdate(next));
		},
		[dispatch],
	);

	return { enabled, setEnabled } as const;
};
