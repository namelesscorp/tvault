import { Navigate, NonIndexRouteObject } from "react-router-dom";
import { RouteTypes } from "interfaces";
import { Dashboard } from "features/Dashboard";
import { Layout } from "features/Layout";
import { Settings } from "features/Settings";
import {
	ContainerDetails,
	VaultBasicStep,
	VaultCommentStep,
	VaultContainerStep,
	VaultDecryptRunStep,
	VaultDecryptSummaryStep,
	VaultEncryptRunStep,
	VaultEntropyGenStep,
	VaultIntegrityPasswordStep,
	VaultIntegrityStep,
	VaultKeyManualStep,
	VaultKeySourceStep,
	VaultOpenIntegrityStep,
	VaultOutputStep,
	VaultOutputTokensFile,
	VaultPasswordStep,
	VaultShamirFileStep,
	VaultShamirMethodStep,
	VaultShamirStep,
	VaultSplitConfigStep,
	VaultSplitToggleStep,
	VaultSummaryStep,
} from "features/Vault";

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
				path: RouteTypes.VaultCreateBasic,
				element: <VaultBasicStep />,
			},
			{
				path: RouteTypes.VaultCreateComment,
				element: <VaultCommentStep />,
			},
			{
				path: RouteTypes.VaultCreateKeySource,
				element: <VaultKeySourceStep />,
			},
			{
				path: RouteTypes.VaultCreateKeyManual,
				element: <VaultKeyManualStep />,
			},
			{
				path: RouteTypes.VaultCreateEntropyGen,
				element: <VaultEntropyGenStep />,
			},
			{
				path: RouteTypes.VaultCreateSplitToggle,
				element: <VaultSplitToggleStep />,
			},
			{
				path: RouteTypes.VaultCreateSplitConfig,
				element: <VaultSplitConfigStep />,
			},
			{
				path: RouteTypes.VaultCreateIntegrity,
				element: <VaultIntegrityStep />,
			},
			{
				path: RouteTypes.VaultCreateIntegrityPassword,
				element: <VaultIntegrityPasswordStep />,
			},
			{
				path: RouteTypes.VaultCreateOutput,
				element: <VaultOutputStep />,
			},
			{
				path: RouteTypes.VaultCreateOutputFile,
				element: <VaultOutputTokensFile />,
			},
			{
				path: RouteTypes.VaultCreateIntegrity,
				element: <VaultIntegrityStep />,
			},
			{
				path: RouteTypes.VaultCreateSummary,
				element: <VaultSummaryStep />,
			},
			{
				path: RouteTypes.VaultCreateEncryptRun,
				element: <VaultEncryptRunStep />,
			},
			{
				path: RouteTypes.VaultOpenContainer,
				element: <VaultContainerStep />,
			},
			{
				path: RouteTypes.VaultOpenPassword,
				element: <VaultPasswordStep />,
			},
			{
				path: RouteTypes.VaultOpenShamir,
				element: <VaultShamirStep />,
			},
			{
				path: RouteTypes.VaultOpenShamirMethod,
				element: <VaultShamirMethodStep />,
			},
			{
				path: RouteTypes.VaultOpenShamirFile,
				element: <VaultShamirFileStep />,
			},
			{
				path: RouteTypes.VaultOpenIntegrity,
				element: <VaultOpenIntegrityStep />,
			},
			{
				path: RouteTypes.VaultOpenSummary,
				element: <VaultDecryptSummaryStep />,
			},
			{
				path: RouteTypes.VaultOpenRun,
				element: <VaultDecryptRunStep />,
			},
			{
				path: RouteTypes.ContainerDetails,
				element: <ContainerDetails />,
			},
			{
				path: RouteTypes.Settings,
				element: <Settings />,
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
