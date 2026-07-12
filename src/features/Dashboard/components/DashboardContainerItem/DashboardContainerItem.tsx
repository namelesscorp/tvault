import { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import {
	getContainerName,
	getSecurityColors,
	getSecurityScore,
} from "../../Dashboard.utils";
import { ContainerInfoData } from "interfaces";
import { cn, formatBytes, formatRelativeTime } from "utils";
import { useLocale } from "features/Localization";
import { useTheme } from "features/Theme";
import { UIButton, UIImgIcon, UISwapValue } from "features/UI";
import { icons } from "assets/collections/icons";
import { DashboardContainerItemTag } from "../DashboardContainerItemTag";
import { DashboardContainerMenu } from "../DashboardContainerMenu";

const DashboardContainerItem = ({
	path,
	isOpened,
	info,
	lastOpenedAt,
	index = 0,
	closing = false,
	closingProgress = 0,
	onBrowse,
	onLock,
	onUnlock,
	onEdit,
	onInfo,
	onRemove,
	onDelete,
}: {
	path: string;
	isOpened: boolean;
	info?: ContainerInfoData;
	lastOpenedAt?: number;
	/** Only staggers the entrance, so the grid fills in instead of appearing at once. */
	index?: number;
	closing?: boolean;
	closingProgress?: number;
	onBrowse: () => void;
	onLock: () => void;
	onUnlock: () => void;
	onEdit: () => void;
	onInfo: () => void;
	onRemove: () => void;
	onDelete: () => void;
}) => {
	const { resolved } = useTheme();
	const { formatMessage } = useIntl();
	const { locale } = useLocale();
	const [menuOpen, setMenuOpen] = useState(false);

	/** Old containers carry no sizes, and with compression=none the two match. */
	const hasOriginalSize =
		typeof info?.uncompressed_size === "number" &&
		info.uncompressed_size !== info.compressed_size;

	const securityTags = useMemo(() => {
		const tags = [];

		if (info?.integrity_provider_type === "hmac") {
			tags.push({
				text: "HMAC",
				bgColor: resolved === "dark" ? "#264B4F" : "#DAF4E0",
				textColor: "var(--success-alt)",
				icon: icons.fingerprint,
			});
		}

		const tokenTypeText =
			info?.token_type === "master"
				? "Master token"
				: info?.token_type === "share"
					? "Share tokens"
					: "Password";
		tags.push({
			text: tokenTypeText,
			bgColor: resolved === "dark" ? "#2C4163" : "#D5DFFE",
			textColor: resolved === "dark" ? "#60A5FA" : "#3A73ED",
			icon: icons.key,
		});

		/** The core reports the score; older containers simply do not carry one. */
		const securityScore = getSecurityScore(info);
		if (securityScore !== null) {
			const colors = getSecurityColors(securityScore);
			tags.push({
				text: `${securityScore}% Security`,
				bgColor: colors.tint,
				textColor: colors.text,
				icon: icons.shield_2,
			});
		}

		return tags;
	}, [resolved, info]);

	return (
		<div
			/** Capped, or the last cards of a long list would crawl in seconds late. */
			style={{ animationDelay: `${Math.min(index, 7) * 50}ms` }}
			className={cn(
				"flex flex-col p-[15px] rounded-[10px] border bg-surface border-line card-shadow hover-lift animate-enter-up",
			)}>
			<div className="flex items-start justify-between">
				<p
					title={path}
					className={cn(
						"text-[24px] font-bold leading-[26px] tracking-[-0.05em] max-w-[290px] overflow-hidden text-ellipsis whitespace-nowrap text-fg",
					)}>
					{getContainerName(path, info)}
				</p>
				<div className="relative">
					<UIImgIcon
						icon={icons.dots_vertical}
						width={25}
						height={25}
						pointer
						onClick={() => setMenuOpen(prev => !prev)}
						color={
							resolved === "dark"
								? "#ffffff"
								: "rgba(0, 0, 0, 0.7)"
						}
					/>
					<DashboardContainerMenu
						open={menuOpen}
						onClose={() => setMenuOpen(false)}
						items={[
							{
								key: "edit",
								label: formatMessage({
									id: "container.menu.edit",
								}),
								onClick: onEdit,
							},
							{
								key: "info",
								label: formatMessage({
									id: "container.menu.info",
								}),
								onClick: onInfo,
							},
							{
								key: "remove",
								label: formatMessage({
									id: "container.menu.remove",
								}),
								onClick: onRemove,
							},
							{
								key: "delete",
								label: formatMessage({
									id: "container.menu.delete",
								}),
								danger: true,
								onClick: onDelete,
							},
						]}
					/>
				</div>
			</div>
			<div className="flex flex-wrap items-center gap-x-[10px] gap-y-[5px] mt-[20px]">
				{securityTags.map(tag => (
					<DashboardContainerItemTag key={tag.text} {...tag} />
				))}
			</div>
			<div
				className={cn(
					"flex h-[74px] items-center justify-around rounded-[10px] mt-[20px] bg-elevated",
					{
						"border border-black/70": resolved === "light",
					},
				)}>
				<div className="flex flex-col items-center justify-center gap-[5px]">
					<div className="flex items-center gap-[5px]">
						<UIImgIcon
							icon={icons.file}
							width={20}
							height={20}
							color={"var(--muted)"}
						/>
						<p
							className={cn(
								"text-[16px] font-medium tracking-[-0.05em] text-muted",
							)}>
							{formatMessage({ id: "dashboard.info.files" })}
						</p>
					</div>
					<p
						className={cn(
							"text-[16px] font-bold tracking-[-0.05em] text-fg-soft",
						)}>
						{info?.file_count?.toLocaleString() ?? "—"}
					</p>
				</div>
				{/** Hovering the cell rolls the packed size over to the original one. */}
				<div className="group flex flex-col items-center justify-center gap-[5px] cursor-default">
					<div className="flex items-center gap-[5px]">
						<UIImgIcon
							icon={icons.database}
							width={20}
							height={20}
							color={"var(--muted)"}
						/>
						<UISwapValue
							height={24}
							value={formatMessage({ id: "dashboard.info.size" })}
							hoverValue={
								hasOriginalSize
									? formatMessage({
											id: "dashboard.info.sizeOriginal",
										})
									: undefined
							}
							className="text-[16px] font-medium tracking-[-0.05em] text-muted"
						/>
					</div>
					<UISwapValue
						height={24}
						value={formatBytes(info?.compressed_size)}
						hoverValue={
							hasOriginalSize
								? formatBytes(info?.uncompressed_size)
								: undefined
						}
						className="text-[16px] font-bold tracking-[-0.05em] text-fg-soft"
					/>
				</div>
			</div>
			{/** Kept at a minimum height even when empty so cards without tags line
			 * up with the ones that have them. */}
			<div className="flex flex-wrap items-center gap-x-[10px] gap-y-[5px] mt-[15px] min-h-[20px]">
				{info?.tags?.map(tag => (
					<DashboardContainerItemTag
						key={tag}
						text={tag}
						bgColor={resolved === "dark" ? "#2C4163" : "#D5DFFE"}
						textColor={resolved === "dark" ? "#60A5FA" : "#3A73ED"}
					/>
				))}
			</div>
			{/** `mt-auto` matters once a wrapped tag row makes one card taller than its
			 * neighbours: the slack lands above the buttons, so the footers of every
			 * card in the row stay level. */}
			{isOpened && (
				<div className="grid grid-cols-2 gap-[10px] mt-auto pt-[15px]">
					<UIButton
						icon={icons.eye}
						text={formatMessage({ id: "dashboard.info.browse" })}
						disabled={closing}
						center
						noTheme
						style={{
							backgroundColor: "var(--accent-green)",
							color: "#ffffff",
						}}
						onClick={onBrowse}
					/>
					<UIButton
						icon={icons.lock}
						text={
							closing
								? `${closingProgress}%`
								: formatMessage({ id: "dashboard.info.lock" })
						}
						loading={closing}
						center
						onClick={onLock}
					/>
				</div>
			)}
			{!isOpened && (
				<div className="mt-auto pt-[15px]">
					<UIButton
						icon={icons.unlock}
						text={formatMessage({ id: "dashboard.info.unlock" })}
						center
						noTheme
						style={{
							backgroundColor: "var(--accent-blue)",
							color: "#ffffff",
						}}
						onClick={onUnlock}
					/>
				</div>
			)}
			<div
				className={cn("w-full h-[1px] mt-[20px]", {
					"bg-white/20": resolved === "dark",
					"bg-black/20": resolved === "light",
				})}
			/>
			<div className="flex justify-center gap-[5px] pt-[26px] pb-[4px]">
				<UIImgIcon
					icon={icons.calendar}
					width={20}
					height={20}
					color={"var(--muted)"}
				/>
				<p
					className={cn(
						"text-[16px] font-medium tracking-[-0.05em] text-muted",
					)}>
					{formatMessage({ id: "dashboard.info.lastAccessed" })}{" "}
					{formatRelativeTime(lastOpenedAt, locale)}
				</p>
			</div>
		</div>
	);
};

export { DashboardContainerItem };
