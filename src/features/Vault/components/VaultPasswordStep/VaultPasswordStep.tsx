import { useCallback, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RouteTypes } from "interfaces";
import { LocalizationTypes, useLocale } from "features/Localization";
import { useAppDispatch } from "features/Store";
import { UIButton, UIPasswordField, UISectionHeading } from "features/UI";
import { icons } from "assets";
import { vaultSetOpenWizardState } from "../../state/Vault.actions";
import { selectVaultOpenWizardState } from "../../state/Vault.selectors";

const VaultPasswordStep = () => {
	const { formatMessage } = useIntl();
	const wizard = useSelector(selectVaultOpenWizardState);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { locale } = useLocale();

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
				{formatMessage({
					id: `vault.passwordStep.step.${wizard.tokenType}`,
				})}
			</p>
			<div className="flex flex-col gap-[20px] p-[20px] bg-white/5 rounded-[10px] mt-[20px]">
				{wizard.tokenType === "master" ? (
					<div className="flex flex-col gap-[10px]">
						<p className="text-[20px] text-white text-medium">
							{formatMessage({
								id: "vault.passwordStep.masterToken",
							})}
							:
						</p>
						<UIPasswordField
							value={masterToken}
							onChange={e => setMasterToken(e.target.value)}
							placeholder="Master token"
							style={{
								maxWidth:
									locale === LocalizationTypes.Russian
										? "75%"
										: "50%",
							}}
						/>
					</div>
				) : (
					<div className="flex flex-col gap-[10px]">
						<p className="text-[20px] text-white text-medium">
							{formatMessage({ id: "vault.passwordStep.none" })}:
						</p>
						<UIPasswordField
							value={pwd}
							onChange={e => setPwd(e.target.value)}
							placeholder="Enter"
							style={{
								maxWidth:
									locale === LocalizationTypes.Russian
										? "75%"
										: "50%",
							}}
						/>
					</div>
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
