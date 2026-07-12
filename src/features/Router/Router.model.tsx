import { Navigate, NonIndexRouteObject } from "react-router-dom";
import { RouteTypes } from "interfaces";
import { Dashboard } from "features/Dashboard";
import { Layout } from "features/Layout";

/**
 * The vault flows live in modals now (see features/Modal), so the app is a single
 * page — the old per-step wizard routes are gone along with their components.
 */
export const routes: NonIndexRouteObject[] = [
	{
		path: "/",
		element: <Layout />,
		children: [
			{
				path: RouteTypes.Dashboard,
				element: <Dashboard />,
			},
			{
				path: "*",
				element: <Navigate to={RouteTypes.Dashboard} />,
			},
			{
				path: "/",
				element: <Navigate to={RouteTypes.Dashboard} />,
			},
		],
	},
];

export const ROUTER_BASE_PATH = "/";
