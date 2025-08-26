import { useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RouteTypes } from "interfaces";
import { useAppDispatch } from "features/Store";
import { UIButton, UIInput, UISectionHeading } from "features/UI";
import { vaultSetOpenWizardState } from "features/Vault/state/Vault.actions";
import { selectVaultOpenWizardState } from "features/Vault/state/Vault.selectors";
import { icons } from "assets";

const VaultOpenIntegrityStep = () => {
	const { formatMessage } = useIntl();
	const wizard = useSelector(selectVaultOpenWizardState);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const [pwd, setPwd] = useState<string>(wizard.additionalPassword || "");

	const next = () => {
		if (!pwd.trim()) {
			toast.error(formatMessage({ id: "vault.integrityStep.error" }));
			return;
		}
		dispatch(
			vaultSetOpenWizardState({
				...wizard,
				additionalPassword: pwd,
			}),
		);

		navigate(RouteTypes.VaultOpenSummary);
	};

	return (
		<div>
			<UISectionHeading
				icon={icons.unlock}
				text={formatMessage({ id: "title.open" })}
			/>
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				{formatMessage({ id: "vault.integrityStep.step" })}
			</p>
			<div className="flex flex-col gap-[20px] p-[20px] bg-white/5 rounded-[10px] mt-[20px]">
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						{formatMessage({ id: "vault.integrityStep.password" })}:
					</p>
					<UIInput
						type="password"
						placeholder={formatMessage({
							id: "common.passwordPlaceholder",
						})}
						value={pwd}
						onChange={e => setPwd(e.target.value)}
						style={{ maxWidth: "50%" }}
					/>
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

export { VaultOpenIntegrityStep };
