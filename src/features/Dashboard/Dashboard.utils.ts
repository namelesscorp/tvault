import { ContainerInfoData } from "interfaces";

/**
 * The core scores the container itself (token type, integrity provider, Shamir
 * parameters, passphrase strength, sensitive files) and reports 0.0 – 1.0.
 */
export const getSecurityScore = (info?: ContainerInfoData): number | null => {
	if (typeof info?.security_score !== "number") return null;
	return Math.round(info.security_score * 100);
};

export const getContainerName = (
	path: string,
	info?: ContainerInfoData,
): string => {
	if (info?.name) return info.name;
	const base = path.split(/[\\/]/).pop() ?? path;
	return base.replace(/\.tvlt$/i, "");
};

/**
 * Single source of truth for the score scale, so the card badge, the stats tile
 * and anything else added later cannot drift apart.
 */
export const getSecurityTone = (score: number) => {
	if (score < 30) return "danger" as const;
	if (score > 70) return "success" as const;
	return "warning" as const;
};

export const getSecurityColors = (score: number) => {
	const tone = getSecurityTone(score);

	return {
		text: `var(--${tone})`,
		tint: `var(--tint-${tone})`,
	};
};
