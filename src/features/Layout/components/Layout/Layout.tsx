import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { cn } from "utils";
import { setAppNavigate } from "features/Router/navigation";
import { useBackgroundContainerScan, useVaultStateReset } from "features/Vault";
import { LayoutHeader } from "../LayoutHeader";

const Layout = () => {
	useVaultStateReset();
	useBackgroundContainerScan();
	const navigate = useNavigate();

	useEffect(() => {
		setAppNavigate(navigate);
		return () => setAppNavigate(null);
	}, [navigate]);

	return (
		<div className={cn("h-screen flex flex-col bg-[#101318] bg-app")}>
			<LayoutHeader />
			<main className="flex-1 min-h-0">
				<Outlet />
			</main>
		</div>
	);
};

export { Layout };
