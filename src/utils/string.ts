/*
  Lowercase
 */
export function lc(value: string) {
	return value?.toLowerCase();
}

/*
  Uppercase
 */
export function uc(value: string) {
	return value?.toUpperCase();
}

export function replaceSpacesWithDashes(path: string) {
	return path?.replace(/\s/g, "-");
}

export function replaceDashesWithSpaces(path: string) {
	return path?.replace(/-/g, " ");
}

export const capitalize = (s: string) => s && s[0].toUpperCase() + s.slice(1);

/**
 * Turns a vault name into a file name: the name the user typed stays untouched in
 * the container metadata, but the file it lives in gets no spaces (they need
 * quoting in a shell and travel badly between systems) and none of the characters
 * a filesystem would reject.
 */
export const toFileName = (name: string, fallback = "vault"): string => {
	const safe = name
		.trim()
		/** A run of spaces becomes one underscore, not one per space. */
		.replace(/\s+/g, "_")
		.replace(/[<>:"/\\|?*]/g, "_")
		/** A name made only of those characters would come out as "____". */
		.replace(/^[._]+|[._]+$/g, "");

	return safe || fallback;
};

/**
 * The share list is copied as one block, so each token is labelled — pasting a bare
 * wall of strings back into the unlock form is how people mix up which share is which.
 */
export const formatTokenList = (tokens: string[]): string =>
	tokens.map((token, index) => `Token #${index + 1}: ${token}`).join("\n");

/** Undoes the label above, so a pasted "Token #2: abc" still unlocks the vault. */
export const stripTokenLabel = (value: string): string =>
	value.replace(/^\s*token\s*#?\s*\d+\s*:\s*/i, "");

/** Byte sizes reported by the core (compressed_size / uncompressed_size). */
export const formatBytes = (bytes?: number): string => {
	if (typeof bytes !== "number" || bytes < 0) return "—";
	if (bytes < 1024) return `${bytes} B`;

	const units = ["KB", "MB", "GB", "TB", "PB"];
	let value = bytes / 1024;
	let unit = 0;

	while (value >= 1024 && unit < units.length - 1) {
		value /= 1024;
		unit += 1;
	}

	return `${value >= 10 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
};
