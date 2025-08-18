import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RouteTypes } from "interfaces";
import { useAppDispatch } from "features/Store";
import { UIButton, UIRadioCard, UISectionHeading } from "features/UI";
import type { TokenType } from "features/Vault/Vault.model";
import { icons } from "~/assets/collections/icons";
import { vaultSetWizardState } from "../../state/Vault.actions";
import { selectVaultWizardState } from "../../state/Vault.selectors";

const VaultSplitToggleStep = () => {
	const wizard = useSelector(selectVaultWizardState);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const [tokenType, setTokenType] = useState<TokenType>(
		wizard.tokenType || "share",
	);

	const next = () => {
		let nextRoute: string;
		if (tokenType === "share") {
			nextRoute = RouteTypes.VaultCreateSplitConfig;
		} else if (tokenType === "none") {
			nextRoute = RouteTypes.VaultCreateSummary;
		} else {
			nextRoute = RouteTypes.VaultCreateOutput;
		}

		dispatch(
			vaultSetWizardState({
				...wizard,
				tokenType,
				shareDest: tokenType === "none" ? "stdout" : wizard.shareDest,
			}),
		);
		navigate(nextRoute);
	};

	return (
		<div>
			<UISectionHeading icon={icons.lock} text={"Create"} />
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				Step 4 / 6 — Token
			</p>
			<div
				className={`grid ${wizard.integrityProvider === "none" ? "grid-cols-[260px_260px_260px]" : "grid-cols-[260px_260px]"} justify-center p-[20px] bg-white/5 rounded-[10px] mt-[20px] gap-[40px]`}>
				<UIRadioCard
					title="Master"
					subtitle="One master token will be generated for open container."
					selected={tokenType === "master"}
					onClick={() => setTokenType("master")}
				/>
				<UIRadioCard
					title="Share"
					subtitle="A set of tokens will be generated using the Shamir method according to the specified parameters for open container."
					selected={tokenType === "share"}
					onClick={() => setTokenType("share")}
				/>
				{wizard.integrityProvider === "none" && (
					<UIRadioCard
						title="Disable"
						subtitle="To open the container, not a token will be used, but a regular password that was generated or entered at the initial stage."
						selected={tokenType === "none"}
						onClick={() => setTokenType("none")}
					/>
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
					style={{ width: "fit-content" }}
				/>
			</div>
		</div>
	);
};

export { VaultSplitToggleStep };
