import { BoxIcon, DashboardIcon, LockClosedIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { NavLink, useLocation } from "react-router-dom";

import { RouteTypes } from "interfaces";

const items = [
	{ to: RouteTypes.Main, label: "Dashboard", icon: DashboardIcon },
	{ to: RouteTypes.CreateVault, label: "Create Vault", icon: BoxIcon },
	{ to: RouteTypes.OpenVault, label: "Open Vault", icon: LockClosedIcon },
];

const LayoutSidebar = () => {
	const { pathname } = useLocation();

	return (
		<aside className="w-44 shrink-0 border-r border-gray-6 bg-gray-1">
			<nav className="flex flex-col mt-4">
				{items.map(({ to, label, icon: Icon }) => (
					<NavLink
						key={to}
						to={to}
						className={clsx(
							"flex items-center gap-2 px-4 py-2 text-sm rounded-r-full hover:bg-violet-3",
							pathname === to
								? "bg-violet-4 text-violet-11 font-medium"
								: "text-gray-11",
						)}>
						<Icon className="w-4 h-4" />
						{label}
					</NavLink>
				))}
			</nav>
		</aside>
	);
};

export { LayoutSidebar };
