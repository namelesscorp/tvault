import { useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RouteTypes } from "interfaces";
import { useAppDispatch } from "features/Store";
import { UIButton, UIRadioCard, UISectionHeading } from "features/UI";
import { icons } from "assets";
import { vaultSetWizardState } from "../../state/Vault.actions";
import { selectVaultWizardState } from "../../state/Vault.selectors";

export type ShareDest = "file" | "stdout";

const VaultOutputStep = () => {
	const { formatMessage } = useIntl();
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
			<UISectionHeading
				icon={icons.lock}
				text={formatMessage({ id: "title.create" })}
			/>
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				{formatMessage({ id: `vault.output.step.${wizard.tokenType}` })}
			</p>
			<div
				className={`grid grid-cols-[260px_260px] justify-center p-[20px] bg-white/5 rounded-[10px] mt-[20px] gap-[40px]`}>
				<UIRadioCard
					title={formatMessage({ id: "vault.output.file" })}
					subtitle={formatMessage({
						id: "vault.output.fileDescription",
					})}
					selected={shareDest === "file"}
					onClick={() => setDest("file")}
				/>
				<UIRadioCard
					title={formatMessage({ id: "vault.output.stdout" })}
					subtitle={formatMessage({
						id: "vault.output.stdoutDescription",
					})}
					selected={shareDest === "stdout"}
					onClick={() => setDest("stdout")}
				/>
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

export { VaultOutputStep };
