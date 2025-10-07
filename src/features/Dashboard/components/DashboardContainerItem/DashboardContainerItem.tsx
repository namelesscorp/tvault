import { useMemo } from "react";
import { useIntl } from "react-intl";
import { cn } from "utils";
import { useTheme } from "features/Theme";
import { UIButton, UIImgIcon } from "features/UI";
import { icons } from "assets/collections/icons";
import { ContainerInfoData } from "~/interfaces";
import { DashboardContainerItemTag } from "../DashboardContainerItemTag";

const DashboardContainerItem = ({
	path,
	mountDir,
	isOpened,
	info,
	savedMountPath,
}: {
	path: string;
	mountDir: string;
	isOpened: boolean;
	info?: ContainerInfoData;
	savedMountPath?: string;
}) => {
	const { resolved } = useTheme();
	const { formatMessage } = useIntl();

	const securityTags = useMemo(() => {
		const tags = [];

		if (info?.integrity_provider_type === "hmac") {
			tags.push({
				text: "HMAC",
				bgColor: resolved === "dark" ? "#264B4F" : "#DAF4E0",
				textColor: resolved === "dark" ? "#34D399" : "#2E9253",
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

		const secutiryScore =
			info?.integrity_provider_type === "hmac" &&
			info?.token_type === "share"
				? 100
				: 15;
		if (secutiryScore > 50) {
			tags.push({
				text: `${secutiryScore}% Security`,
				bgColor: resolved === "dark" ? "#274A4F" : "#DAF4E0",
				textColor: resolved === "dark" ? "#49DE80" : "#2E9253",
				icon: icons.shield_2,
			});
		} else {
			tags.push({
				text: `${secutiryScore}% Security`,
				bgColor: resolved === "dark" ? "#4A2E3F" : "#FEDBDA",
				textColor: resolved === "dark" ? "#F87171" : "#E65757",
				icon: icons.shield_2,
			});
		}

		return tags;
	}, [resolved, info]);

	return (
		<div
			className={cn("flex flex-col p-[15px] rounded-[10px] border", {
				"bg-[#ffffff]/3": resolved === "dark",
				"bg-[#ffffff]/80": resolved === "light",
				"border-[#313A4F]": resolved === "dark",
				"border-black/70": resolved === "light",
				"card-shadow": resolved === "light",
			})}>
			<div className="flex items-start justify-between">
				<p
					className={cn(
						"text-[24px] font-bold leading-[26px] tracking-[-0.05em] max-w-[290px] overflow-hidden text-ellipsis whitespace-nowrap",
						{
							"text-white": resolved === "dark",
							"text-black/80": resolved === "light",
						},
					)}>
					{info?.name}
				</p>
				<UIImgIcon
					icon={icons.dots_vertical}
					width={25}
					height={25}
					color={
						resolved === "dark" ? "#ffffff" : "rgba(0, 0, 0, 0.7)"
					}
				/>
			</div>
			<div className="flex items-center gap-[10px] mt-[44px]">
				{securityTags.map(tag => (
					<DashboardContainerItemTag key={tag.text} {...tag} />
				))}
			</div>
			<div
				className={cn(
					"flex h-[74px] items-center justify-around rounded-[10px] mt-[20px]",
					{
						"bg-[#293449]": resolved === "dark",
						"bg-white": resolved === "light",
						"border border-black/70": resolved === "light",
					},
				)}>
				<div className="flex flex-col items-center justify-center gap-[5px]">
					<div className="flex items-center gap-[5px]">
						<UIImgIcon
							icon={icons.folder}
							width={20}
							height={20}
							color={
								resolved === "dark"
									? "rgba(255, 255, 255, 0.7)"
									: "rgba(0, 0, 0, 0.7)"
							}
						/>
						<p
							className={cn(
								"text-[16px] font-medium tracking-[-0.05em]",
								{
									"text-white/70": resolved === "dark",
									"text-black/70": resolved === "light",
								},
							)}>
							{formatMessage({ id: "dashboard.info.files" })}
						</p>
					</div>
					<p
						className={cn(
							"text-[16px] font-bold tracking-[-0.05em]",
							{
								"text-white": resolved === "dark",
								"text-black/70": resolved === "light",
							},
						)}>
						100
					</p>
				</div>
				<div className="flex flex-col items-center justify-center gap-[5px]">
					<div className="flex items-center gap-[5px]">
						<UIImgIcon
							icon={icons.database}
							width={20}
							height={20}
							color={
								resolved === "dark"
									? "rgba(255, 255, 255, 0.7)"
									: "rgba(0, 0, 0, 0.7)"
							}
						/>
						<p
							className={cn(
								"text-[16px] font-medium tracking-[-0.05em]",
								{
									"text-white/70": resolved === "dark",
									"text-black/70": resolved === "light",
								},
							)}>
							{formatMessage({ id: "dashboard.info.size" })}
						</p>
					</div>
					<p
						className={cn(
							"text-[16px] font-bold tracking-[-0.05em]",
							{
								"text-white": resolved === "dark",
								"text-black/70": resolved === "light",
							},
						)}>
						2.5 GB
					</p>
				</div>
			</div>
			<div className="flex items-center gap-[10px] mt-[20px] h-[20px]">
				{info?.tags?.map(tag => (
					<DashboardContainerItemTag
						key={tag}
						text={tag}
						bgColor={resolved === "dark" ? "#2C4163" : "#D5DFFE"}
						textColor={resolved === "dark" ? "#60A5FA" : "#3A73ED"}
					/>
				))}
			</div>
			{isOpened && (
				<div className="grid grid-cols-2 gap-[10px] mt-[29px]">
					<UIButton
						icon={icons.unlock}
						text={formatMessage({ id: "dashboard.info.browse" })}
						center
						noTheme
						style={{
							backgroundColor:
								resolved === "dark" ? "#16853F" : "#2E9253",
							color: "#ffffff",
						}}
						onClick={() => {}}
					/>
					<UIButton
						icon={icons.lock}
						text={formatMessage({ id: "dashboard.info.lock" })}
						center
						onClick={() => {}}
					/>
				</div>
			)}
			{!isOpened && (
				<div className="mt-[29px]">
					<UIButton
						icon={icons.unlock}
						text={formatMessage({ id: "dashboard.info.unlock" })}
						center
						noTheme
						style={{
							backgroundColor:
								resolved === "dark" ? "#2463EB" : "#3A73ED",
							color: "#ffffff",
						}}
						onClick={() => {}}
					/>
				</div>
			)}
			<div
				className={cn("w-full h-[1px] mt-[20px]", {
					"bg-white/20": resolved === "dark",
					"bg-black/20": resolved === "light",
				})}
			/>
			<div className="flex justify-center gap-[5px] pt-[26px] pb-[9px]">
				<UIImgIcon
					icon={icons.calendar}
					width={20}
					height={20}
					color={
						resolved === "dark"
							? "rgba(255, 255, 255, 0.7)"
							: "rgba(0, 0, 0, 0.7)"
					}
				/>
				<p
					className={cn(
						"text-[16px] font-medium tracking-[-0.05em]",
						{
							"text-white/70": resolved === "dark",
							"text-black/70": resolved === "light",
						},
					)}>
					{formatMessage({ id: "dashboard.info.lastAccessed" })}
				</p>
			</div>
		</div>
	);
};

export { DashboardContainerItem };
