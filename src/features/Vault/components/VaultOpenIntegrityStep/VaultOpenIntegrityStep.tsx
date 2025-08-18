import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RouteTypes } from "interfaces";
import { useAppDispatch } from "features/Store";
import { UIButton, UIInput, UISectionHeading } from "features/UI";
import { vaultSetOpenWizardState } from "features/Vault/state/Vault.actions";
import { selectVaultOpenWizardState } from "features/Vault/state/Vault.selectors";
import { icons } from "~/assets/collections/icons";

const VaultOpenIntegrityStep = () => {
	const wizard = useSelector(selectVaultOpenWizardState);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const [pwd, setPwd] = useState<string>(wizard.additionalPassword || "");
	const [err, setErr] = useState<string | null>(null);

	const next = () => {
		if (!pwd.trim()) {
			setErr("Enter additional password");
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
			<UISectionHeading icon={icons.unlock} text={"Open"} />
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				Step 2 / 6 — Integrity Password
			</p>
			<div className="flex flex-col gap-[20px] p-[20px] bg-white/5 rounded-[10px] mt-[20px]">
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						Integrity provider password:
					</p>
					<UIInput
						type="password"
						placeholder="Enter"
						value={pwd}
						onChange={e => setPwd(e.target.value)}
						style={{ maxWidth: "50%" }}
					/>
				</div>
				{err && <p className="text-[14px] text-red-400">{err}</p>}
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

export { VaultOpenIntegrityStep };
