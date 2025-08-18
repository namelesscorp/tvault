import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RouteTypes } from "interfaces";
import { useAppDispatch } from "features/Store";
import { UIButton, UIInput, UISectionHeading } from "features/UI";
import { icons } from "~/assets/collections/icons";
import { vaultSetOpenWizardState } from "../../state/Vault.actions";
import { selectVaultOpenWizardState } from "../../state/Vault.selectors";

const VaultShamirStep = () => {
	const wizard = useSelector(selectVaultOpenWizardState);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const [shares, setShares] = useState<string[]>(
		wizard.shares && wizard.shares.length ? wizard.shares : [""],
	);
	const [err, setErr] = useState<string | null>(null);

	useEffect(() => {
		if (shares.length === 0 || shares[shares.length - 1] !== "") {
			setShares(prev => [...prev, ""]);
		}
	}, [shares]);

	const update = useCallback((idx: number, val: string) => {
		setShares(prev => prev.map((s, i) => (i === idx ? val : s)));
	}, []);

	const readyShares = useMemo(
		() => shares.filter(s => s.trim().length > 0),
		[shares],
	);
	const hasEnoughShares = useMemo(
		() => readyShares.length >= 2,
		[readyShares],
	);

	const next = useCallback(() => {
		if (!hasEnoughShares) {
			setErr("Minimum 2 shares");
			return;
		}
		dispatch(
			vaultSetOpenWizardState({
				...wizard,
				shares: readyShares,
			}),
		);
		if (wizard.integrityProvider === "none") {
			navigate(RouteTypes.VaultOpenSummary);
		} else {
			navigate(RouteTypes.VaultOpenIntegrity);
		}
	}, [dispatch, wizard, readyShares, hasEnoughShares, navigate]);

	return (
		<div>
			<UISectionHeading icon={icons.unlock} text={"Open"} />
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				Step 2 / 6 — Shamir Shares
			</p>
			<div className="flex flex-col gap-[20px] p-[20px] bg-white/5 rounded-[10px] mt-[20px]">
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						Enter Shamir shares:
					</p>
					{shares.map((s, idx) => (
						<UIInput
							key={idx}
							placeholder={`Шер #${idx + 1}`}
							value={s}
							onChange={e => update(idx, e.target.value)}
							style={{ maxWidth: "100%" }}
						/>
					))}
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

export { VaultShamirStep };
