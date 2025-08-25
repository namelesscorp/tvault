import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RouteTypes } from "interfaces";
import { EntropyCanvas } from "features/EntropyCanvas";
import { useAppDispatch } from "features/Store";
import { UISectionHeading } from "features/UI";
import { icons } from "~/assets/collections/icons";
import { vaultSetWizardState } from "../../state/Vault.actions";
import { selectVaultWizardState } from "../../state/Vault.selectors";

const VaultEntropyGenStep = () => {
	const { formatMessage } = useIntl();
	const wizard = useSelector(selectVaultWizardState);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	return (
		<div>
			<UISectionHeading
				icon={icons.lock}
				text={formatMessage({ id: "title.create" })}
			/>
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				{formatMessage({ id: "vault.entropyGen.step" })}
			</p>
			<div className="flex flex-col items-center justify-center p-[20px] gap-[20px] mt-[20px] bg-white/5 rounded-[10px]">
				<p className="text-[20px] text-white text-medium">
					{formatMessage({ id: "vault.entropyGen.description" })}:
				</p>
				<EntropyCanvas
					onReady={() => {
						const bytes = new Uint8Array(32);
						crypto.getRandomValues(bytes);
						const b64 = btoa(String.fromCharCode(...bytes));
						dispatch(
							vaultSetWizardState({ ...wizard, passphrase: b64 }),
						);
						navigate(RouteTypes.VaultCreateIntegrity);
					}}
				/>
			</div>
		</div>
	);
};

export { VaultEntropyGenStep };
