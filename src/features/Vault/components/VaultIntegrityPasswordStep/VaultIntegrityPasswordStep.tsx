import { useState } from "react";
import { useIntl } from "react-intl";
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

const pwdSchema = z
	.string()
	.min(8, "common.passwordError.minLength")
	.brand<"Password">();
const formSchema = z
	.object({
		p1: pwdSchema,
		p2: pwdSchema,
	})
	.refine(({ p1, p2 }) => p1 === p2, {
		message: "common.passwordError",
		path: ["p2"],
	});

const VaultIntegrityPasswordStep = () => {
	const { formatMessage } = useIntl();
	const wizard = useSelector(selectVaultWizardState);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const [p1, setP1] = useState(wizard.additionalPassword || "");
	const [p2, setP2] = useState("");

	const submit = () => {
		const chk = formSchema.safeParse({ p1, p2 });
		if (!chk.success) {
			toast.error(formatMessage({ id: chk.error.issues[0].message }));
			return;
		}
		dispatch(vaultSetWizardState({ ...wizard, additionalPassword: p1 }));
		navigate(RouteTypes.VaultCreateSplitToggle);
	};

	return (
		<div>
			<UISectionHeading
				icon={icons.lock}
				text={formatMessage({ id: "title.create" })}
			/>
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				{formatMessage({ id: "vault.integrityPassword.step" })}
			</p>
			<div className="flex flex-col gap-[20px] p-[20px] bg-white/5 rounded-[10px] mt-[20px]">
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						{formatMessage({
							id: "vault.integrityPassword.password",
						})}
						:
					</p>
					<UIPasswordField
						value={p1}
						onChange={e => setP1(e.target.value)}
						placeholder={formatMessage({
							id: "common.passwordPlaceholder",
						})}
						style={{ maxWidth: "50%" }}
					/>
				</div>
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						{formatMessage({
							id: "vault.integrityPassword.passwordConfirm",
						})}
						:
					</p>
					<UIPasswordField
						value={p2}
						onChange={e => setP2(e.target.value)}
						placeholder={formatMessage({
							id: "common.passwordPlaceholder",
						})}
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
					onClick={submit}
					disabled={p1.length === 0 || p2.length === 0}
					style={{ width: "fit-content" }}
				/>
			</div>
		</div>
	);
};

export { VaultIntegrityPasswordStep };
