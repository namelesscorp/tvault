import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RouteTypes } from "interfaces";
import { UIButton, UIRadioCard, UISectionHeading } from "features/UI";
import { icons } from "~/assets/collections/icons";
import { useAppDispatch } from "~/features/Store";
import { vaultSetWizardState } from "../../state/Vault.actions";
import { selectVaultWizardState } from "../../state/Vault.selectors";

export type IntegrityProvider = "none" | "hmac";

const VaultIntegrityStep = () => {
	const wizard = useSelector(selectVaultWizardState);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const [provider, setProvider] = useState<IntegrityProvider>(
		wizard.integrityProvider,
	);

	const next = () => {
		dispatch(
			vaultSetWizardState({ ...wizard, integrityProvider: provider }),
		);
		if (provider === "hmac") {
			navigate(RouteTypes.VaultCreateIntegrityPassword);
		} else {
			navigate(RouteTypes.VaultCreateSplitToggle);
		}
	};

	return (
		<div>
			<UISectionHeading icon={icons.lock} text={"Create"} />
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				Step 3 / 6 — Integrity Provider
			</p>
			<div className="grid grid-cols-[260px_260px] justify-center p-[20px] bg-white/5 rounded-[10px] mt-[20px] gap-[40px]">
				<UIRadioCard
					title="None"
					subtitle="Container will be saved without HMAC."
					selected={provider === "none"}
					onClick={() => setProvider("none")}
				/>
				<UIRadioCard
					title="HMAC-SHA256"
					subtitle="Adds HMAC for container integrity check. Requires additional password."
					selected={provider === "hmac"}
					onClick={() => setProvider("hmac")}
				/>
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

export { VaultIntegrityStep };
