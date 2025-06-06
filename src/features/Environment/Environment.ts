export enum EnvironmentTypes {
	Production = "production",
	Development = "development",
	Staging = "staging",
}

export const environmentVersion = APP_VERSION;
export const environmentEnv = import.meta.env.MODE as EnvironmentTypes;

export const apiUrl = "";
