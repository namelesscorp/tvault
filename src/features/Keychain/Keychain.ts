import { invoke } from "@tauri-apps/api/core";
import { devError } from "utils";

/**
 * Thin wrappers over the Rust keychain commands. The secret stored per vault is
 * the password (token=none), the master token (token=master), or the shares
 * joined with "|" (token=share). The HMAC integrity password is NEVER stored —
 * it is always entered by hand.
 *
 * Everything is a no-op / false on non-macOS: the Rust side reports the platform
 * through `keychain_available`, and the UI hides the feature accordingly.
 */

/** Everything needed to open a vault, returned after one biometric prompt. */
export interface KeychainSecret {
	/** Password, master token, or shares joined by "|". */
	secret: string;
	/** HMAC integrity password, if the vault has one and it was saved. */
	hmac: string | null;
}

/** Stores the unlock secret and, optionally, the HMAC integrity password. */
export const keychainSet = (
	account: string,
	secret: string,
	hmac?: string,
): Promise<void> =>
	invoke<void>("keychain_set", { account, secret, hmac: hmac ?? null });

/** Triggers the Touch ID / password sheet; rejects with "cancelled" on dismiss. */
export const keychainGet = (
	account: string,
	prompt: string,
): Promise<KeychainSecret> =>
	invoke<KeychainSecret>("keychain_get", { account, prompt });

/** Existence probe — never prompts for biometrics. */
export const keychainHas = async (account: string): Promise<boolean> => {
	try {
		return await invoke<boolean>("keychain_has", { account });
	} catch (e) {
		devError(e);
		return false;
	}
};

export const keychainDelete = async (account: string): Promise<void> => {
	try {
		await invoke<void>("keychain_delete", { account });
	} catch (e) {
		devError(e);
	}
};

/** Best-effort account rename when a vault file is moved during reseal. */
export const keychainMove = async (from: string, to: string): Promise<void> => {
	if (!from || !to || from === to) return;
	try {
		await invoke<void>("keychain_move", { from, to });
	} catch (e) {
		devError(e);
	}
};

let availableCache: boolean | null = null;

/** Whether the OS keychain integration is available (macOS only), cached. */
export const keychainAvailable = async (): Promise<boolean> => {
	if (availableCache !== null) return availableCache;
	try {
		availableCache = await invoke<boolean>("keychain_available");
	} catch {
		availableCache = false;
	}
	return availableCache;
};

/**
 * The single secret that unlocks a vault of the given token type — mirrors what
 * the create wizard shows on the "vault created" screen.
 */
export const secretForTokenType = (
	tokenType: string | undefined,
	parts: { password?: string; masterToken?: string; shares?: string[] },
): string | undefined => {
	switch (tokenType) {
		case "none":
			return parts.password || undefined;
		case "master":
			return parts.masterToken || undefined;
		case "share":
			return parts.shares?.length ? parts.shares.join("|") : undefined;
		default:
			return undefined;
	}
};
