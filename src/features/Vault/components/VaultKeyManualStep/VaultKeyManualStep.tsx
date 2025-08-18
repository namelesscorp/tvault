import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";
import { RouteTypes } from "interfaces";
import { useAppDispatch } from "features/Store";
import { UIButton, UIPasswordField, UISectionHeading } from "features/UI";
import { icons } from "~/assets/collections/icons";
import { vaultSetWizardState } from "../../state/Vault.actions";
import { selectVaultWizardState } from "../../state/Vault.selectors";

const pwdSchema = z.string().min(8, "Minimum 8 characters").brand<"Password">();
const formSchema = z
	.object({
		p1: pwdSchema,
		p2: pwdSchema,
	})
	.refine(({ p1, p2 }) => p1 === p2, {
		message: "Passwords do not match",
		path: ["p2"],
	});

const VaultKeyManualStep = () => {
	const wizard = useSelector(selectVaultWizardState);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const [p1, setP1] = useState("");
	const [p2, setP2] = useState("");

	const submit = () => {
		const chk = formSchema.safeParse({ p1, p2 });
		if (!chk.success) {
			toast.error(chk.error.issues[0].message);
			return;
		}
		dispatch(
			vaultSetWizardState({ ...wizard, password: p1, passphrase: p1 }),
		);
		navigate(RouteTypes.VaultCreateIntegrity);
	};

	return (
		<div>
			<UISectionHeading icon={icons.lock} text={"Create"} />
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				Step 3 / 6 — Container Key (Manual)
			</p>
			<div className="flex flex-col gap-[20px] p-[20px] bg-white/5 rounded-[10px] mt-[20px]">
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						Container password:
					</p>
					<UIPasswordField
						value={p1}
						onChange={e => setP1(e.target.value)}
						placeholder="Enter password"
						style={{ maxWidth: "50%" }}
					/>
				</div>
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						Repeat container password:
					</p>
					<UIPasswordField
						value={p2}
						onChange={e => setP2(e.target.value)}
						placeholder="Enter password"
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
					disabled={p1.length === 0 || p2.length === 0}
					style={{ width: "fit-content" }}
				/>
			</div>
		</div>
	);
};

export { VaultKeyManualStep };
