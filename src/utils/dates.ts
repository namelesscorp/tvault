export const convertToTimestamp = (dateString: string): number => {
	return new Date(dateString).getTime() / 1000;
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
