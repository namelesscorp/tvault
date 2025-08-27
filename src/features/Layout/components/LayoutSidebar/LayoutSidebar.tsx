import { useMemo } from "react";
import { useIntl } from "react-intl";
import { NavLink, useLocation } from "react-router-dom";
import { RouteTypes } from "interfaces";
import { UIButton, UIIconButton } from "features/UI";
import { useWizardNavigation } from "features/Vault";
import { icons } from "assets";

const LayoutSidebar = () => {
	const { pathname } = useLocation();
	const { formatMessage } = useIntl();
	const { navigateToLastCreateStep, navigateToLastOpenStep } =
		useWizardNavigation();

	const navItems = useMemo(
		() => [
			{
				to: RouteTypes.Dashboard,
				label: "menu.dashboard",
				icon: icons.grid,
				isActive: pathname === RouteTypes.Dashboard,
				onClick: undefined,
			},
			{
				to: RouteTypes.VaultCreateBasic,
				label: "menu.create",
				icon: icons.lock,
				isActive: pathname.startsWith("/create"),
				onClick: navigateToLastCreateStep,
			},
			{
				to: RouteTypes.VaultOpenContainer,
				label: "menu.open",
				icon: icons.unlock,
				isActive: pathname.startsWith("/open"),
				onClick: navigateToLastOpenStep,
			},
		],
		[pathname, navigateToLastCreateStep, navigateToLastOpenStep],
	);

	return (
		<aside className="w-[200px] min-w-[200px] flex flex-col justify-between bg-black/10 border-r border-white/10 p-[10px]">
			<nav className="flex flex-col gap-[10px]">
				{navItems.map(({ to, label, icon, isActive, onClick }) =>
					onClick ? (
						<button key={to} onClick={onClick} className="w-full">
							<UIButton
								text={formatMessage({ id: label })}
								icon={icon}
								active={isActive}
							/>
						</button>
					) : (
						<NavLink key={to} to={to}>
							<UIButton
								text={formatMessage({ id: label })}
								icon={icon}
								active={isActive}
							/>
						</NavLink>
					),
				)}
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
