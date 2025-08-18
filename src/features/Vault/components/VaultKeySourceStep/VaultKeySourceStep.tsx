import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RouteTypes } from "interfaces";
import { useAppDispatch } from "features/Store";
import { UIButton, UISectionHeading } from "features/UI";
import { UIRadioCard } from "features/UI";
import { icons } from "~/assets/collections/icons";
import { vaultSetWizardState } from "../../state/Vault.actions";
import { selectVaultWizardState } from "../../state/Vault.selectors";

export type KeySource = "generated" | "manual";

const VaultKeySourceStep = () => {
	const wizard = useSelector(selectVaultWizardState);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const [selected, setSelected] = useState<KeySource>(wizard.keySource);

	const handleSelect = (val: KeySource) => {
		setSelected(val);
		dispatch(vaultSetWizardState({ ...wizard, keySource: val }));
	};

	const next = (val: KeySource) => {
		dispatch(vaultSetWizardState({ ...wizard, keySource: val }));
		navigate(
			val === "generated"
				? RouteTypes.VaultCreateEntropyGen
				: RouteTypes.VaultCreateKeyManual,
		);
	};

	return (
		<div>
			<UISectionHeading icon={icons.lock} text={"Create"} />
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				Step 2 / 6 — Container Key
			</p>
			<div className="grid grid-cols-[260px_260px] justify-center p-[20px] bg-white/5 rounded-[10px] mt-[20px] gap-[40px]">
				<UIRadioCard
					title="Generated"
					subtitle="Will be created from 512-bits of entropy. Stronger than the user's password."
					selected={selected === "generated"}
					onClick={() => handleSelect("generated")}
				/>
				<UIRadioCard
					title="Manual"
					subtitle="Create your own password."
					selected={selected === "manual"}
					onClick={() => handleSelect("manual")}
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
					onClick={() => next(selected)}
					style={{ width: "fit-content" }}
				/>
			</div>
		</div>
	);
};

export { VaultKeySourceStep };
