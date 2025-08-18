import { open } from "@tauri-apps/plugin-dialog";
import { useCallback, useState } from "react";
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
			<UISectionHeading icon={icons.unlock} text={"Open"} />
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				Step 2 / 6 — Load Shamir Shares from File
			</p>
			<div className="flex flex-col gap-[20px] p-[20px] bg-white/5 rounded-[10px] mt-[20px]">
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						Path to share tokens file:
					</p>
					<div className="flex items-center gap-[10px]">
						<UIInput
							value={jsonFilePath || ""}
							placeholder="Choose"
							style={{ maxWidth: "50%" }}
							readOnly
						/>
						<UIButton
							icon={icons.folder}
							text="Browse"
							onClick={pickJson}
							style={{ width: "fit-content" }}
						/>
					</div>
				</div>
			</div>
			<div className="flex items-center gap-[10px] mt-[20px]">
				<UIButton
					icon={icons.back}
					text="Back"
					onClick={() => navigate(-1)}
					style={{ width: "fit-content" }}
				/>
				<UIButton
					icon={icons.arrow_right}
					text="Next"
					onClick={next}
					style={{ width: "fit-content" }}
				/>
			</div>
		</div>
	);
};

export { VaultShamirFileStep };
