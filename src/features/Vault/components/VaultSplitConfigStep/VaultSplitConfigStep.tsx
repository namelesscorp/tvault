import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";
import { RouteTypes } from "interfaces";
import { useAppDispatch } from "features/Store";
import { UIButton, UIInput, UISectionHeading } from "features/UI";
import {
	SHAMIR_MAX_SHARES,
	SHAMIR_MIN_SHARES,
} from "features/Vault/Vault.model";
import { icons } from "~/assets/collections/icons";
import { vaultSetWizardState } from "../../state/Vault.actions";
import { selectVaultWizardState } from "../../state/Vault.selectors";

const schema = z
	.object({
		k: z.number().int().min(SHAMIR_MIN_SHARES).max(SHAMIR_MAX_SHARES),
		n: z.number().int().min(SHAMIR_MIN_SHARES).max(SHAMIR_MAX_SHARES),
	})
	.refine(({ k, n }) => k <= n, {
		message: "k must be ≤ n",
		path: ["k"],
	});

const VaultSplitConfigStep = () => {
	const wizard = useSelector(selectVaultWizardState);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const [k, setK] = useState<number>(wizard.k);
	const [n, setN] = useState<number>(wizard.n);

	const submit = () => {
		const parsed = schema.safeParse({ k, n });
		if (!parsed.success) {
			toast.error(parsed.error.issues[0].message);
			return;
		}
		dispatch(vaultSetWizardState({ ...wizard, k, n }));
		navigate(RouteTypes.VaultCreateOutput);
	};

	const num = (s: string) => Number.parseInt(s.replace(/\D/g, "") || "0", 10);

	return (
		<div>
			<UISectionHeading icon={icons.lock} text={"Create"} />
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				Step 4 / 6 — Token (Share)
			</p>
			<div className="flex flex-col gap-[20px] p-[20px] bg-white/5 rounded-[10px] mt-[20px]">
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						N — number of tokens to be generated:
					</p>
					<UIInput
						type="number"
						value={n}
						onChange={e => setN(num(e.target.value))}
						placeholder="Enter N"
						style={{ maxWidth: "50%" }}
					/>
				</div>
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						K — token threshold for opening a container:
					</p>
					<UIInput
						type="number"
						value={k}
						onChange={e => setK(num(e.target.value))}
						placeholder="Enter K"
						style={{ maxWidth: "50%" }}
					/>
				</div>
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
					onClick={submit}
					style={{ width: "fit-content" }}
				/>
			</div>
		</div>
	);
};

export { VaultSplitConfigStep };
