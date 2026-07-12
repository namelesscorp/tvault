import { useCallback } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "features/Store";
import { appChangeAnimations } from "../state/App.actions";
import { selectAppAnimations } from "../state/App.selectors";

/**
 * Motion is switched off in CSS by a class on <html>, so components only need
 * this when the animation is driven by JS rather than by a stylesheet — see the
 * counting stats tiles.
 */
export const useAnimations = () => {
	const dispatch = useAppDispatch();
	const enabled = useSelector(selectAppAnimations);

	const setEnabled = useCallback(
		(next: boolean) => {
			dispatch(appChangeAnimations(next));
		},
		[dispatch],
	);

	return { enabled, setEnabled } as const;
};
