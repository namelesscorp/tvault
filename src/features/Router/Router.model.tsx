/* eslint-disable react-refresh/only-export-components */
import { Navigate, NonIndexRouteObject } from "react-router-dom";

import { RouteTypes } from "interfaces";

import { Layout } from "features/Layout";
import { Main } from "features/Main";
import { VaultCreate, VaultOpen } from "features/Vault";

export const routes: NonIndexRouteObject[] = [
	{
		path: "/",
		element: <Layout />,
		children: [
			{
				path: RouteTypes.Main,
				element: <Main />,
			},
			{
				path: RouteTypes.CreateVault,
				element: <VaultCreate />,
			},
			{
				path: RouteTypes.OpenVault,
				element: <VaultOpen />,
			},
			{
				path: "*",
				element: <Navigate to={RouteTypes.Main} />,
			},
			{
				path: "/",
				element: <Navigate to={RouteTypes.Main} />,
			},
		],
	},
];

export const ROUTER_BASE_PATH = "/";
