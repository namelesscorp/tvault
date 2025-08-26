import { ContainerInfoData } from "interfaces";
import { RouteTypes } from "interfaces";

export type KeySource = "generated" | "manual";
export type ShareEncoding = "base64" | "hex";
export type CompressionType = "zip" | "none";
export type ShareDestination = "file" | "stdout";
export type IntegrityProvider = "none" | "hmac";
export type DecryptMethod = "password" | "shamir";
export type TokenType = "master" | "share" | "none";

export const SHAMIR_MIN_SHARES = 2;
export const SHAMIR_MAX_SHARES = 16;
export const SHAMIR_DEFAULT_THRESHOLD = 3;
export const SHAMIR_DEFAULT_TOTAL = 5;

export interface VaultBasicInfo {
	name: string;
	path: string;
}

export interface VaultWizardState {
	/* basic info */
	name: string;
	outputPath: string;
	comment: string;
	tags: string;

	/* key */
	keySource: KeySource;
	password?: string; // if manual
	generatedKey?: string; // base64

	/* shamir */
	split: boolean;
	k: number;
	n: number;
	shareEncoding: ShareEncoding;

	/* token */
	tokenType: TokenType;

	/* container */
	compression: CompressionType;
	inputPath: string;
	passphrase?: string;

	/* output shares / password */
	shareDest: ShareDestination;
	sharePath?: string;

	/* integrity */
	integrityProvider: IntegrityProvider;
	additionalPassword?: string;

	/* last step tracking */
	lastStep?: RouteTypes;

	/* execution results */
	encryptCompleted?: boolean;
	encryptResult?: {
		masterToken?: string;
		shares?: string[];
		password?: string;
		additionalPassword?: string;
	};
}

export interface VaultOpenWizardState {
	/* container */
	containerPath: string;
	mountDir: string;
	autoMountDir: boolean;
	customMountDir?: string;

	/* container info */
	tokenType: TokenType;
	integrityProvider: IntegrityProvider;

	/* method */
	method: DecryptMethod;

	/* credentials */
	password?: string;
	masterToken?: string;
	shares?: string[];
	tokenJsonPath?: string;

	/* integrity */
	additionalPassword?: string;

	/* quick open flow: skip selection/summary and jump between only required steps */
	quickOpen?: boolean;

	/* last step tracking */
	lastStep?: RouteTypes;

	/* execution results */
	decryptCompleted?: boolean;
	decryptResult?: {
		mountDir: string;
		containerPath: string;
	};
}

export interface ResealData {
	containerPath: string;
	mountDir: string;
	containerInfo: ContainerInfoData;
	passphrase?: string;
	masterToken?: string;
	shares?: string[];
	tokenJsonPath?: string;
	additionalPassword?: string;
	originalAdditionalPassword?: string;
	method: DecryptMethod;
	tokenType: TokenType;
	integrityProvider: IntegrityProvider;
}
