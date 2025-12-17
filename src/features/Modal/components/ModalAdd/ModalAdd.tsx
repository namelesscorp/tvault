import { useIntl } from "react-intl";
import { useTheme } from "features/Theme";
import { cn } from "utils";
import { UIButton, UIImgIcon, UIInput } from "features/UI";
import { icons } from "assets";

const ModalAdd = () => {
	const { formatMessage } = useIntl();
	const { resolved } = useTheme();

	return (
		<div>
			<p className={cn("text-[16px] font-medium tracking-[-0.05em] ", {
				"text-white/70": resolved === "dark",
				"text-black/70": resolved === "light",
			})}>
				{formatMessage({ id: "modal.add.info.title" })}
			</p>
			<div className="flex flex-col gap-[20px] mt-[20px]">
				<div className={cn(
					"w-full flex flex-col gap-[10px] border rounded-[10px] p-[15px]",
					{
						"bg-white/3": resolved === "dark",
						"bg-white/80": resolved === "light",
						"border-[#313A4F]": resolved === "dark",
						"border-black/70": resolved === "light",
					},
				)}>
					<div className="flex items-center gap-[10px]">
					<UIImgIcon
						icon={icons.key_2}
						width={28}
						height={28}
						color={resolved === "dark" ? "#538DD5" : "#538DD5"}
					/>
					<p className={cn("text-[16px] font-semibold tracking-[-0.05em] ", {
						"text-white": resolved === "dark",
						"text-black": resolved === "light",
					})}>
						{formatMessage({ id: "modal.add.file.title" })}
					</p>
					</div>
					<p className={cn("text-[16px] font-medium tracking-[-0.05em] ", {
						"text-white/70": resolved === "dark",
						"text-black/70": resolved === "light",
					})}>{formatMessage({ id: "modal.add.file.description.1" })} <span className="font-semibold italic">*.tvlt</span> {formatMessage({ id: "modal.add.file.description.2" })}</p>
					<div className="flex flex-col gap-[10px] mt-[10px]">
						<p className={cn("text-[14px] font-semibold tracking-[-0.05em]", {
							"text-white": resolved === "dark",
							"text-black": resolved === "light",
						})}>{formatMessage({ id: "modal.add.file.input.title" })}</p>
						<div className="flex items-center gap-[10px]">
							<UIInput
								placeholder={formatMessage({ id: "modal.add.file.input.placeholder" })}
								style={{ width: 275 }}
							/>
							<UIButton
								icon={icons.eye}
								text={formatMessage({ id: "common.browse" })}
								style={{ width: "fit-content", backgroundColor: "#16853F", color: "#ffffff" }}
								color="#ffffff"
								noTheme
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export { ModalAdd };