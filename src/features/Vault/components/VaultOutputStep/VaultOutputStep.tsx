import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RouteTypes } from "interfaces";
import { useAppDispatch } from "features/Store";
import { UIButton, UIRadioCard, UISectionHeading } from "features/UI";
import { icons } from "~/assets/collections/icons";
import { vaultSetWizardState } from "../../state/Vault.actions";
import { selectVaultWizardState } from "../../state/Vault.selectors";

export type ShareDest = "file" | "stdout";

const VaultOutputStep = () => {
	const wizard = useSelector(selectVaultWizardState);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const [shareDest, setDest] = useState<ShareDest>(wizard.shareDest);

	const next = () => {
		if (shareDest === "file") {
			dispatch(
				vaultSetWizardState({
					...wizard,
					shareDest,
				}),
			);
			navigate(RouteTypes.VaultCreateOutputFile);
			return;
		}
		dispatch(
			vaultSetWizardState({
				...wizard,
				shareDest,
			}),
		);
		navigate(RouteTypes.VaultCreateSummary);
	};

	return (
		<div>
			<UISectionHeading icon={icons.lock} text={"Create"} />
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				Step 5 / 6 — Save container share tokens
			</p>
			<div
				className={`grid grid-cols-[260px_260px] justify-center p-[20px] bg-white/5 rounded-[10px] mt-[20px] gap-[40px]`}>
				<UIRadioCard
					title="File"
					subtitle="Tokens will be saved to file for open container."
					selected={shareDest === "file"}
					onClick={() => setDest("file")}
				/>
				<UIRadioCard
					title="Screen"
					subtitle="Tokens will be displayed on screen for open container."
					selected={shareDest === "stdout"}
					onClick={() => setDest("stdout")}
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

export { VaultOutputStep };
