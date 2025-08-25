import { useMemo } from "react";
import { useIntl } from "react-intl";
import { NavLink, useLocation } from "react-router-dom";
import { RouteTypes } from "interfaces";
import { icons } from "~/assets/collections/icons";
import { UIButton } from "~/features/UI";
import { UIIconButton } from "~/features/UI/components/UIIconButton";

const items = [
	{ to: RouteTypes.Dashboard, label: "menu.dashboard", icon: icons.grid },
	{ to: RouteTypes.VaultCreateBasic, label: "menu.create", icon: icons.lock },
	{
		to: RouteTypes.VaultOpenContainer,
		label: "menu.open",
		icon: icons.unlock,
	},
];

const LayoutSidebar = () => {
	const { pathname } = useLocation();
	const { formatMessage } = useIntl();

	const navItems = useMemo(
		() =>
			items.map(({ to, label, icon }) => {
				let isActive = false;

				if (to === RouteTypes.Dashboard) {
					isActive = pathname === to;
				} else if (to === RouteTypes.VaultCreateBasic) {
					isActive = pathname.startsWith("/create");
				} else if (to === RouteTypes.VaultOpenContainer) {
					isActive = pathname.startsWith("/open");
				}

				return {
					to,
					label,
					icon,
					isActive,
				};
			}),
		[pathname],
	);

	return (
		<aside className="w-[200px] min-w-[200px] flex flex-col justify-between bg-black/10 border-r border-white/10 p-[10px]">
			<nav className="flex flex-col gap-[10px]">
				{navItems.map(({ to, label, icon, isActive }) => (
					<NavLink key={to} to={to}>
						<UIButton
							text={formatMessage({ id: label })}
							icon={icon}
							active={isActive}
						/>
					</NavLink>
				))}
			</nav>
			<div className="flex items-center gap-[10px]">
				<NavLink to={RouteTypes.Settings}>
					<UIIconButton
						icon={icons.settings}
						active={pathname === RouteTypes.Settings}
					/>
				</NavLink>
				<NavLink
					to="mailto:support@tvault.app"
					target="_blank"
					rel="noopener noreferrer">
					<UIIconButton icon={icons.help_circle} />
				</NavLink>
				<NavLink
					to="https://tvault.app"
					target="_blank"
					rel="noopener noreferrer">
					<UIIconButton icon={icons.globe} />
				</NavLink>
			</div>
		</aside>
	);
};

export { LayoutSidebar };
