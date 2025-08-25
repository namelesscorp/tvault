import { join } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";
import { RouteTypes } from "interfaces";
import { icons } from "~/assets/collections/icons";
import { LocalizationTypes, useLocale } from "~/features/Localization";
import { useAppDispatch } from "~/features/Store";
import { UIButton, UIInput, UISectionHeading } from "~/features/UI";
import { vaultSetWizardState } from "../../state/Vault.actions";
import { selectVaultWizardState } from "../../state/Vault.selectors";

const schema = z.object({
	sharePath: z.string().min(1, "vault.output.file.error.path"),
});

const VaultOutputTokensFile = () => {
	const { formatMessage } = useIntl();
	const wizard = useSelector(selectVaultWizardState);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { locale } = useLocale();
	const [sharePath, setPath] = useState<string>(wizard.sharePath || "");

	const pickFile = async () => {
		const dir = await open({ directory: true, multiple: false });
		if (typeof dir !== "string") return;
		const safe = (wizard.name || "shares").replace(/[^a-z0-9_-]/gi, "_");
		const newPath = await join(dir, `${safe}.shares.json`);
		setPath(newPath);
	};

	const next = () => {
		const parsed = schema.safeParse({ sharePath });
		if (!parsed.success) {
			toast.error(formatMessage({ id: parsed.error.issues[0].message }));
			return;
		}

		dispatch(
			vaultSetWizardState({
				...wizard,
				sharePath,
			}),
		);
		navigate(RouteTypes.VaultCreateSummary);
	};

	return (
		<div>
			<UISectionHeading
				icon={icons.lock}
				text={formatMessage({ id: "title.create" })}
			/>
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				{formatMessage({ id: "vault.output.file.step.share" })}
			</p>
			<div className="flex flex-col gap-[20px] p-[20px] bg-white/5 rounded-[10px] mt-[20px]">
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						{formatMessage({
							id: `vault.output.file.path.${wizard.tokenType}`,
						})}
					</p>
					<div className="flex items-center gap-[10px]">
						<UIInput
							value={sharePath}
							placeholder={formatMessage({
								id: "vault.output.file.pathPlaceholder",
							})}
							style={{
								maxWidth:
									locale === LocalizationTypes.Russian
										? "75%"
										: "50%",
							}}
							readOnly
						/>
						<UIButton
							icon={icons.folder}
							text={formatMessage({ id: "common.browse" })}
							onClick={pickFile}
							style={{ width: "fit-content" }}
						/>
					</div>
				</div>
			</div>
			<div className="flex items-center gap-[10px] mt-[20px]">
				<UIButton
					icon={icons.back}
					text={formatMessage({ id: "common.back" })}
					onClick={() => navigate(-1)}
					style={{ width: "fit-content" }}
				/>
				<UIButton
					icon={icons.arrow_right}
					text={formatMessage({ id: "common.next" })}
					onClick={next}
					style={{ width: "fit-content" }}
					disabled={!sharePath.trim()}
				/>
			</div>
		</div>
	);
};

export { VaultOutputTokensFile };
