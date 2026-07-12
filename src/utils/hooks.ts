import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook for creating a function that executes only once
 * @param fn Function to execute
 * @returns Protected function
 */
export function useOnceGuard<T extends (...args: any[]) => any>(fn: T): T {
	const executedRef = useRef(false);
	const resultRef = useRef<any>();

	return useCallback(
		(...args: any[]) => {
			if (executedRef.current) {
				return resultRef.current;
			}
			executedRef.current = true;
			resultRef.current = fn(...args);
			return resultRef.current;
		},
		[fn],
	) as T;
}

/**
 * Hook for creating an async function that executes only once
 * @param fn Async function to execute
 * @returns Protected async function
 */
export function useAsyncOnceGuard<T extends (...args: any[]) => Promise<any>>(
	fn: T,
): T {
	const executedRef = useRef(false);
	const resultRef = useRef<any>();

	return useCallback(
		async (...args: any[]) => {
			if (executedRef.current) {
				return resultRef.current;
			}
			executedRef.current = true;
			resultRef.current = fn(...args);
			return resultRef.current;
		},
		[fn],
	) as T;
}

/**
 * Hook for creating a function with the ability to reset state
 * @param fn Function to execute
 * @returns Object with protected function and reset method
 */
export function useResettableGuard<T extends (...args: any[]) => any>(fn: T) {
	const executedRef = useRef(false);
	const resultRef = useRef<any>();

	const guardedFn = useCallback(
		(...args: any[]) => {
			if (executedRef.current) {
				return resultRef.current;
			}
			executedRef.current = true;
			resultRef.current = fn(...args);
			return resultRef.current;
		},
		[fn],
	) as T;

	const reset = useCallback(() => {
		executedRef.current = false;
		resultRef.current = undefined;
	}, []);

	return { fn: guardedFn, reset };
}

/**
 * Hook for creating an async function with the ability to reset state
 * @param fn Async function to execute
 * @returns Object with protected function and reset method
 */
export function useAsyncResettableGuard<
	T extends (...args: any[]) => Promise<any>,
>(fn: T) {
	const executedRef = useRef(false);
	const resultRef = useRef<any>();

	const guardedFn = useCallback(
		async (...args: any[]) => {
			if (executedRef.current) {
				return resultRef.current;
			}
			executedRef.current = true;
			resultRef.current = fn(...args);
			return resultRef.current;
		},
		[fn],
	) as T;

	const reset = useCallback(() => {
		executedRef.current = false;
		resultRef.current = undefined;
	}, []);

	return { fn: guardedFn, reset };
}

/**
 * Hook for tracking loading state with protection against multiple requests
 * @param requestFn Request function
 * @returns Object with loading state and protected function
 */
export function useRequestGuard<T extends (...args: any[]) => Promise<any>>(
	requestFn: T,
) {
	const loadingRef = useRef(false);
	const requestRef = useRef<Promise<any> | null>(null);

	const guardedRequest = useCallback(
		async (...args: any[]) => {
			if (loadingRef.current && requestRef.current) {
				return requestRef.current;
			}

			loadingRef.current = true;
			requestRef.current = requestFn(...args);

			try {
				const result = await requestRef.current;
				return result;
			} finally {
				loadingRef.current = false;
				requestRef.current = null;
			}
		},
		[requestFn],
	) as T;

	const reset = useCallback(() => {
		loadingRef.current = false;
		requestRef.current = null;
	}, []);

	return {
		fn: guardedRequest,
		reset,
		isLoading: loadingRef.current,
	};
}

/**
 * Runs a number up to its new value instead of snapping to it — the dashboard
 * tiles count in when the app opens and re-count whenever the totals change.
 *
 * `enabled` has to be passed in: this lives in utils, and reaching for the
 * animations setting here would tie utils to the store.
 */
export function useCountUp(
	value: number,
	{
		enabled = true,
		duration = 700,
	}: { enabled?: boolean; duration?: number } = {},
) {
	/** Starts at zero so the very first render counts up rather than appearing done. */
	const [display, setDisplay] = useState(0);
	const fromRef = useRef(0);

	useEffect(() => {
		if (!enabled) {
			fromRef.current = value;
			setDisplay(value);
			return;
		}

		const from = fromRef.current;
		if (from === value) {
			return;
		}

		let frame = 0;
		const start = performance.now();
		const tick = (now: number) => {
			const progress = Math.min(1, (now - start) / duration);
			/** Ease-out cubic: quick off the mark, settles gently on the number. */
			const eased = 1 - Math.pow(1 - progress, 3);
			const next = progress === 1 ? value : from + (value - from) * eased;

			/** Tracking the drawn value keeps an interrupting change smooth. */
			fromRef.current = next;
			setDisplay(next);

			if (progress < 1) {
				frame = requestAnimationFrame(tick);
			}
		};
		frame = requestAnimationFrame(tick);

		return () => cancelAnimationFrame(frame);
	}, [value, enabled, duration]);

	return display;
}

/**
 * Keeps a component mounted while it animates out, so overlays can fade/scale on
 * close instead of vanishing the moment their flag flips to false.
 */
export function useMountTransition(open: boolean, duration = 200) {
	const [mounted, setMounted] = useState(open);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (open) {
			setMounted(true);
			/**
			 * The element has to be painted with its "closed" styles once before we
			 * flip them, or there is nothing to transition from. A timer rather than
			 * requestAnimationFrame — rAF is throttled when the window is inactive.
			 */
			const frame = setTimeout(() => setVisible(true), 10);
			return () => clearTimeout(frame);
		}

		setVisible(false);
		const timer = setTimeout(() => setMounted(false), duration);
		return () => clearTimeout(timer);
	}, [open, duration]);

	return { mounted, visible };
}
