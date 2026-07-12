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
