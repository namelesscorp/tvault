import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RouteTypes } from "interfaces";
import { useAppDispatch } from "features/Store";
import { UIButton, UIPasswordField, UISectionHeading } from "features/UI";
import { icons } from "~/assets/collections/icons";
import { vaultSetOpenWizardState } from "../../state/Vault.actions";
import { selectVaultOpenWizardState } from "../../state/Vault.selectors";

const VaultPasswordStep = () => {
	const wizard = useSelector(selectVaultOpenWizardState);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const [pwd, setPwd] = useState(wizard.password || "");
	const [masterToken, setMasterToken] = useState(wizard.masterToken || "");

	const next = useCallback(() => {
		if (wizard.tokenType === "master") {
			if (!masterToken.trim()) {
				toast.error("Enter master token");
				return;
			}
		} else {
			if (!pwd.length) {
				toast.error("Enter password");
				return;
			}
		}

		dispatch(
			vaultSetOpenWizardState({
				...wizard,
				password: wizard.tokenType === "master" ? undefined : pwd,
				masterToken:
					wizard.tokenType === "master"
						? masterToken.trim()
						: undefined,
			}),
		);
		if (wizard.integrityProvider === "none") {
			navigate(RouteTypes.VaultOpenSummary);
		} else {
			navigate(RouteTypes.VaultOpenIntegrity);
		}
	}, [pwd, masterToken, dispatch, wizard, navigate]);

	return (
		<div>
			<UISectionHeading icon={icons.lock} text="Open" />
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				Step 2 / 4 —{" "}
				{wizard.tokenType === "master"
					? "Master Token"
					: "Container Password"}
			</p>
			<div className="flex flex-col gap-[20px] p-[20px] bg-white/5 rounded-[10px] mt-[20px]">
				{wizard.tokenType === "master" ? (
					<div className="flex flex-col gap-[10px]">
						<p className="text-[20px] text-white text-medium">
							Master token:
						</p>
						<UIPasswordField
							value={masterToken}
							onChange={e => setMasterToken(e.target.value)}
							placeholder="Master token"
							style={{ maxWidth: "50%" }}
						/>
					</div>
				) : (
					<div className="flex flex-col gap-[10px]">
						<p className="text-[20px] text-white text-medium">
							Container password for decrypt:
						</p>
						<UIPasswordField
							value={pwd}
							onChange={e => setPwd(e.target.value)}
							placeholder="Enter"
							style={{ maxWidth: "50%" }}
						/>
					</div>
				)}
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
					disabled={
						wizard.tokenType === "master"
							? masterToken.trim().length === 0
							: pwd.length === 0
					}
					style={{ width: "fit-content" }}
				/>
			</div>
		</div>
	);
};

export { VaultPasswordStep };
