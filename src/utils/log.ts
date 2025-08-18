import { EnvironmentTypes, environmentEnv } from "features/Environment";

/* eslint-disable @typescript-eslint/no-explicit-any */

const style = {
	log: "background-color: rgba(255, 139, 0, 0.4); border-radius: 3px; color: #FFFFFF; padding: 2px 4px",
	info: "background-color: #1648F9; border-radius: 3px; color: #FFFFFF; padding: 2px 4px",
	error: "background-color: #E53E3E; border-radius: 3px; color: #FFFFFF; padding: 2px 4px",
};

// prettier-ignore
export const devLog = (...data: any[]) => {
	if (environmentEnv === EnvironmentTypes.Production) {
		return;
	}
	 
	console.log("%c", style.log, ...data);
};

// prettier-ignore
export const devInfo = (...data: any[]) => {
	if (environmentEnv === EnvironmentTypes.Production) {
		return;
	}
	console.info("%c", style.info, ...data);
};

// prettier-ignore
export const devError = (...data: any[]) => {
	if (environmentEnv === EnvironmentTypes.Production) {
		return;
	}
	console.error("%c", style.error, ...data);
};
