/**
 * Utilities for protecting functions from multiple calls
 */

/**
 * Creates a protected function that executes only once
 * @param fn Function to execute
 * @returns Protected function
 */
export function createOnceGuard<T extends (...args: any[]) => any>(fn: T): T {
	let executed = false;
	let result: any;

	return ((...args: any[]) => {
		if (executed) {
			return result;
		}
		executed = true;
		result = fn(...args);
		return result;
	}) as T;
}

/**
 * Creates a protected async function that executes only once
 * @param fn Async function to execute
 * @returns Protected async function
 */
export function createAsyncOnceGuard<
	T extends (...args: any[]) => Promise<any>,
>(fn: T): T {
	let executed = false;
	let result: any;

	return ((...args: any[]) => {
		if (executed) {
			return result;
		}
		executed = true;
		result = fn(...args);
		return result;
	}) as T;
}

/**
 * Creates a protected function with the ability to reset state
 * @param fn Function to execute
 * @returns Object with protected function and reset method
 */
export function createResettableGuard<T extends (...args: any[]) => any>(
	fn: T,
) {
	let executed = false;
	let result: any;

	const guardedFn = ((...args: any[]) => {
		if (executed) {
			return result;
		}
		executed = true;
		result = fn(...args);
		return result;
	}) as T;

	const reset = () => {
		executed = false;
		result = undefined;
	};

	return { fn: guardedFn, reset };
}

/**
 * Creates a protected async function with the ability to reset state
 * @param fn Async function to execute
 * @returns Object with protected function and reset method
 */
export function createAsyncResettableGuard<
	T extends (...args: any[]) => Promise<any>,
>(fn: T) {
	let executed = false;
	let result: any;

	const guardedFn = ((...args: any[]) => {
		if (executed) {
			return result;
		}
		executed = true;
		result = fn(...args);
		return result;
	}) as T;

	const reset = () => {
		executed = false;
		result = undefined;
	};

	return { fn: guardedFn, reset };
}
