import { Outlet } from "react-router-dom";

import { LayoutHeader } from "../LayoutHeader";
import { LayoutSidebar } from "../LayoutSidebar";

const Layout = () => (
	<div className="h-screen flex flex-col">
		<LayoutHeader />
		<div className="flex flex-1 overflow-hidden">
			<LayoutSidebar />
			<main className="flex-1 overflow-y-auto bg-gray-2 p-4">
				<Outlet />
			</main>
		</div>
	</div>
);

export { Layout };
