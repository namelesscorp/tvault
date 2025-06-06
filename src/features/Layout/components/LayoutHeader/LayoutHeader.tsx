import { LightningBoltIcon } from "@radix-ui/react-icons";
import * as Toolbar from "@radix-ui/react-toolbar";

const LayoutHeader = () => (
	<Toolbar.Root className="h-12 flex items-center px-4 bg-gray-1 border-b border-gray-6 select-none">
		<LightningBoltIcon className="mr-2 text-violet-10" />
		<span className="font-medium text-sm">Trust Vault (single)</span>
		<div className="flex-1" />
		{/* placeholder под статус/language etc. */}
	</Toolbar.Root>
);

export { LayoutHeader };
