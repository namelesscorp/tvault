import { ContainerInfoData } from "interfaces";

/**
 * Rough heuristic shared by the container cards and the stats row: a vault only
 * scores high when the key is split and the container is integrity-protected.
 */
export const getSecurityScore = (info?: ContainerInfoData): number => {
	if (
		info?.integrity_provider_type === "hmac" &&
		info?.token_type === "share"
	)
		return 100;
	return 15;
};

export const getContainerName = (
	path: string,
	info?: ContainerInfoData,
): string => {
	if (info?.name) return info.name;
	const base = path.split(/[\\/]/).pop() ?? path;
	return base.replace(/\.tvlt$/i, "");
};
