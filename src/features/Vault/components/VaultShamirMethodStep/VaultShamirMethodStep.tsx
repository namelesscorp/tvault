import { useCallback, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RouteTypes } from "interfaces";
import { useAppDispatch } from "features/Store";
import { UIButton, UIRadioCard, UISectionHeading } from "features/UI";
import { icons } from "~/assets/collections/icons";
import { vaultSetOpenWizardState } from "../../state/Vault.actions";
import { selectVaultOpenWizardState } from "../../state/Vault.selectors";

type ShamirInputMethod = "manual" | "file";

const VaultShamirMethodStep = () => {
	const { formatMessage } = useIntl();
	const wizard = useSelector(selectVaultOpenWizardState);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const [selected, setSelected] = useState<ShamirInputMethod>("manual");

	const handleSelect = (val: ShamirInputMethod) => {
		setSelected(val);
	};

	const next = useCallback(() => {
		dispatch(
			vaultSetOpenWizardState({
				...wizard,
				method: "shamir",
			}),
		);
		navigate(
			selected === "manual"
				? RouteTypes.VaultOpenShamir
				: RouteTypes.VaultOpenShamirFile,
		);
	}, [dispatch, wizard, selected, navigate]);

	return (
		<div>
			<UISectionHeading
				icon={icons.unlock}
				text={formatMessage({ id: "title.open" })}
			/>
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				{formatMessage({ id: "vault.shamirMethodStep.step" })}
			</p>
			<div className="grid grid-cols-[260px_260px] justify-center p-[20px] bg-white/5 rounded-[10px] mt-[20px] gap-[40px]">
				<UIRadioCard
					title={formatMessage({
						id: "vault.shamirMethodStep.manual",
					})}
					subtitle={formatMessage({
						id: "vault.shamirMethodStep.manualDescription",
					})}
					selected={selected === "manual"}
					onClick={() => handleSelect("manual")}
				/>
				<UIRadioCard
					title={formatMessage({ id: "vault.shamirMethodStep.file" })}
					subtitle={formatMessage({
						id: "vault.shamirMethodStep.fileDescription",
					})}
					selected={selected === "file"}
					onClick={() => handleSelect("file")}
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

export { VaultShamirMethodStep };
