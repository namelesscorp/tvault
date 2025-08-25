import { useState } from "react";
import { useIntl } from "react-intl";
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
	const { formatMessage } = useIntl();
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
			<UISectionHeading
				icon={icons.lock}
				text={formatMessage({ id: "title.create" })}
			/>
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				{formatMessage({ id: "vault.splitToggle.step" })}
			</p>
			<div
				className={`grid ${wizard.integrityProvider === "none" ? "grid-cols-[260px_260px_260px]" : "grid-cols-[260px_260px]"} justify-center p-[20px] bg-white/5 rounded-[10px] mt-[20px] gap-[40px]`}>
				<UIRadioCard
					title={formatMessage({ id: "vault.splitToggle.master" })}
					subtitle={formatMessage({
						id: "vault.splitToggle.masterDescription",
					})}
					selected={tokenType === "master"}
					onClick={() => setTokenType("master")}
				/>
				<UIRadioCard
					title={formatMessage({ id: "vault.splitToggle.share" })}
					subtitle={formatMessage({
						id: "vault.splitToggle.shareDescription",
					})}
					selected={tokenType === "share"}
					onClick={() => setTokenType("share")}
				/>
				{wizard.integrityProvider === "none" && (
					<UIRadioCard
						title={formatMessage({
							id: "vault.splitToggle.disable",
						})}
						subtitle={formatMessage({
							id: "vault.splitToggle.disableDescription",
						})}
						selected={tokenType === "none"}
						onClick={() => setTokenType("none")}
					/>
				)}
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

export { VaultSplitToggleStep };
