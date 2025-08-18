import { useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { RouteTypes } from "interfaces";
import { icons } from "~/assets/collections/icons";
import { UIButton } from "~/features/UI";
import { UIIconButton } from "~/features/UI/components/UIIconButton";

const items = [
	{ to: RouteTypes.Dashboard, label: "Dashboard", icon: icons.grid },
	{ to: RouteTypes.VaultCreateBasic, label: "Create", icon: icons.lock },
	{ to: RouteTypes.VaultOpenContainer, label: "Open", icon: icons.unlock },
];

const LayoutSidebar = () => {
	const { pathname } = useLocation();

	const navItems = useMemo(
		() =>
			items.map(({ to, label, icon }) => ({
				to,
				label,
				icon,
				isActive: pathname === to,
			})),
		[pathname],
	);

	return (
		<aside className="w-[200px] flex flex-col justify-between bg-black/10 border-r border-white/10 p-[10px]">
			<nav className="flex flex-col gap-[10px]">
				{navItems.map(({ to, label, icon, isActive }) => (
					<NavLink key={to} to={to}>
						<UIButton text={label} icon={icon} active={isActive} />
					</NavLink>
				))}
			</nav>
			<div className="flex items-center gap-[10px]">
				<UIIconButton icon={icons.settings} />
				<UIIconButton icon={icons.help_circle} />
				<UIIconButton icon={icons.globe} />
			</div>
		</aside>
	);
};

export { LayoutSidebar };
