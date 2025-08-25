import { open } from "@tauri-apps/plugin-dialog";
import { useCallback, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RouteTypes } from "interfaces";
import { useAppDispatch } from "features/Store";
import { UIButton, UIInput, UISectionHeading } from "features/UI";
import { icons } from "~/assets/collections/icons";
import { vaultSetOpenWizardState } from "../../state/Vault.actions";
import { selectVaultOpenWizardState } from "../../state/Vault.selectors";

const VaultShamirFileStep = () => {
	const { formatMessage } = useIntl();
	const wizard = useSelector(selectVaultOpenWizardState);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const [jsonFilePath, setJsonFilePath] = useState<string | null>(
		wizard.tokenJsonPath || null,
	);

	const pickJson = useCallback(async () => {
		const file = await open({
			multiple: false,
			filters: [{ name: "JSON", extensions: ["json"] }],
		});
		if (typeof file === "string") {
			setJsonFilePath(file);
		}
	}, []);

	const next = useCallback(() => {
		if (!jsonFilePath) {
			toast.error("Select JSON file with shares");
			return;
		}
		dispatch(
			vaultSetOpenWizardState({
				...wizard,
				tokenJsonPath: jsonFilePath,
			}),
		);
		if (wizard.integrityProvider === "none") {
			navigate(RouteTypes.VaultOpenSummary);
		} else {
			navigate(RouteTypes.VaultOpenIntegrity);
		}
	}, [dispatch, wizard, jsonFilePath, navigate]);

	return (
		<div>
			<UISectionHeading
				icon={icons.unlock}
				text={formatMessage({ id: "title.open" })}
			/>
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				{formatMessage({ id: "vault.shamirFileStep.step" })}
			</p>
			<div className="flex flex-col gap-[20px] p-[20px] bg-white/5 rounded-[10px] mt-[20px]">
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						{formatMessage({ id: "vault.shamirFileStep.shares" })}:
					</p>
					<div className="flex items-center gap-[10px]">
						<UIInput
							value={jsonFilePath || ""}
							placeholder={formatMessage({
								id: "common.pathPlaceholder",
							})}
							style={{ maxWidth: "50%" }}
							readOnly
						/>
						<UIButton
							icon={icons.folder}
							text={formatMessage({ id: "common.browse" })}
							onClick={pickJson}
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
				/>
			</div>
		</div>
	);
};

export { VaultShamirFileStep };
