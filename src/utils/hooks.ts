import { useCallback, useRef } from "react";

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
