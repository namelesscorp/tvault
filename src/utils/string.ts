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
