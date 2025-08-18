export interface TvaultStackFrame {
	function: string;
	file: string;
	line: number;
}

export interface TvaultError {
	message: string;
	code: number;
	type: number;
	category: number;
	details?: string;
	suggestion?: string;
	unwrapped?: string[];
	stacktrace?: TvaultStackFrame[];
}

export interface TvaultErrorWithPath {
	path: string;
	error: TvaultError;
}
