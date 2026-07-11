import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { cn } from "utils";
import { setAppNavigate } from "features/Router/navigation";
import { useTheme } from "features/Theme";
import {
	useBackgroundContainerScan,
	useVaultStateReset,
	useWizardStepTracking,
} from "features/Vault";
import { LayoutHeader } from "../LayoutHeader";

const Layout = () => {
	useVaultStateReset();
	useBackgroundContainerScan();
	useWizardStepTracking();
	const { resolved } = useTheme();
	const navigate = useNavigate();

	useEffect(() => {
		setAppNavigate(navigate);
		return () => setAppNavigate(null);
	}, [navigate]);

	return (
		<div
			className={cn("h-screen flex flex-col bg-[#101318]", {
				"bg-[#1D273E]": resolved === "dark",
				"bg-[#F5F7FF]": resolved === "light",
			})}>
			<LayoutHeader />
			<main className="py-[20px]">
				<Outlet />
			</main>
		</div>
	);
};

export { Layout };
