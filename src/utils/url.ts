import { matchPath } from "react-router-dom";

import { RouteTypes } from "interfaces";

export const extractRouteByLocation = (location: string) => {
	const routes = Object.values(RouteTypes);
	const route = routes.map(route => {
		const match = matchPath({ path: route }, location);

		if (match) {
			return match.pattern.path;
		}
	});

	return route.find(item => !!item) || null;
};
