export const convertToTimestamp = (dateString: string): number => {
	return new Date(dateString).getTime() / 1000;
};

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
	["year", 365 * 24 * 60 * 60 * 1000],
	["month", 30 * 24 * 60 * 60 * 1000],
	["day", 24 * 60 * 60 * 1000],
	["hour", 60 * 60 * 1000],
	["minute", 60 * 1000],
];

export const formatRelativeTime = (
	timestamp?: number,
	locale = "en",
): string => {
	if (!timestamp) return "—";

	const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
	const diff = timestamp - Date.now();

	for (const [unit, ms] of RELATIVE_UNITS) {
		if (Math.abs(diff) >= ms) {
			return formatter.format(Math.round(diff / ms), unit);
		}
	}

	return formatter.format(0, "minute");
};

export const formatLocalDateTime = (dateString?: string): string => {
	if (!dateString) return "—";
	const d = new Date(dateString);
	if (isNaN(d.getTime())) return dateString;
	const pad = (n: number) => String(n).padStart(2, "0");
	const dd = pad(d.getDate());
	const mm = pad(d.getMonth() + 1);
	const yyyy = d.getFullYear();
	const hh = pad(d.getHours());
	const mi = pad(d.getMinutes());
	const ss = pad(d.getSeconds());
	return `${dd}.${mm}.${yyyy} ${hh}:${mi}:${ss}`;
};
