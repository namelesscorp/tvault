import { Outlet } from "react-router-dom";
import {
	useBackgroundContainerScan,
	useVaultStateReset,
} from "~/features/Vault";
import { LayoutHeader } from "../LayoutHeader";
import { LayoutSidebar } from "../LayoutSidebar";

const Layout = () => {
	useVaultStateReset();
	useBackgroundContainerScan();

	return (
		<div className="h-screen flex flex-col bg-[#101318]">
			<LayoutHeader />
			<div className="flex flex-1 overflow-hidden">
				<LayoutSidebar />
				<main className="w-full p-[20px]">
					<Outlet />
				</main>
			</div>
		</div>
	);
};

export { Layout };
