import { EnvironmentTypes, environmentEnv } from "features/Environment";

export const devLog = (...data: any[]) => {
	if (environmentEnv === EnvironmentTypes.Production) {
		return;
	}
	// eslint-disable-next-line no-console
	console.log(
		`%c${data.map(item => item.toString()).join(" ")}`,
		`background-color: rgba(255, 139, 0, 0.4); border-radius: 3px; color: #FFFFFF; padding: 2px 4px`,
	);
};

export const devInfo = (...data: any[]) => {
	if (environmentEnv === EnvironmentTypes.Production) {
		return;
	}

	console.info(
		`%c${data.map(item => item.toString()).join(" ")}`,
		`background-color: #1648F9; border-radius: 3px; color: #FFFFFF; padding: 2px 4px`,
	);
};

export const devError = (...data: any[]) => {
	if (environmentEnv === EnvironmentTypes.Production) {
		return;
	}

	console.error(
		`%c${data.map(item => item.toString()).join(" ")}`,
		`background-color: #E53E3E; border-radius: 3px; color: #FFFFFF; padding: 2px 4px`,
	);
};
