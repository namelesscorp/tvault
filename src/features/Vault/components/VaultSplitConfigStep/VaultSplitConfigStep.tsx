import { useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";
import { RouteTypes } from "interfaces";
import { LocalizationTypes, useLocale } from "features/Localization";
import { useAppDispatch } from "features/Store";
import { UIButton, UIInput, UISectionHeading } from "features/UI";
import {
	SHAMIR_MAX_SHARES,
	SHAMIR_MIN_SHARES,
} from "features/Vault/Vault.model";
import { icons } from "assets";
import { vaultSetWizardState } from "../../state/Vault.actions";
import { selectVaultWizardState } from "../../state/Vault.selectors";

const schema = z
	.object({
		k: z
			.string()
			.min(1, "vault.splitConfig.error.required")
			.transform(val => {
				const num = Number.parseInt(val, 10);
				if (isNaN(num)) {
					throw new Error("vault.splitConfig.error.required");
				}
				return num;
			})
			.pipe(
				z
					.number()
					.int()
					.min(SHAMIR_MIN_SHARES, "vault.splitConfig.error.min")
					.max(SHAMIR_MAX_SHARES, "vault.splitConfig.error.max"),
			),
		n: z
			.string()
			.min(1, "vault.splitConfig.error.required")
			.transform(val => {
				const num = Number.parseInt(val, 10);
				if (isNaN(num)) {
					throw new Error("vault.splitConfig.error.required");
				}
				return num;
			})
			.pipe(
				z
					.number()
					.int()
					.min(SHAMIR_MIN_SHARES, "vault.splitConfig.error.min")
					.max(SHAMIR_MAX_SHARES, "vault.splitConfig.error.max"),
			),
	})
	.refine(({ k, n }) => k <= n, {
		message: "vault.splitConfig.error.k",
		path: ["k"],
	});

const VaultSplitConfigStep = () => {
	const { formatMessage } = useIntl();
	const wizard = useSelector(selectVaultWizardState);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { locale } = useLocale();

	const [k, setK] = useState<string>(wizard.k.toString());
	const [n, setN] = useState<string>(wizard.n.toString());

	const submit = () => {
		const parsed = schema.safeParse({ k, n });
		if (!parsed.success) {
			const errorMessage = parsed.error.issues[0].message;
			if (errorMessage === "vault.splitConfig.error.min") {
				toast.error(
					formatMessage(
						{ id: errorMessage },
						{ min: SHAMIR_MIN_SHARES },
					),
				);
			} else if (errorMessage === "vault.splitConfig.error.max") {
				toast.error(
					formatMessage(
						{ id: errorMessage },
						{ max: SHAMIR_MAX_SHARES },
					),
				);
			} else {
				toast.error(formatMessage({ id: errorMessage }));
			}
			return;
		}
		dispatch(
			vaultSetWizardState({
				...wizard,
				k: parsed.data.k,
				n: parsed.data.n,
			}),
		);
		navigate(RouteTypes.VaultCreateOutput);
	};

	const handleNumberChange = (
		value: string,
		setter: (value: string) => void,
	) => {
		const cleanValue = value.replace(/\D/g, "");
		setter(cleanValue);
	};

	return (
		<div>
			<UISectionHeading
				icon={icons.lock}
				text={formatMessage({ id: "title.create" })}
			/>
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				{formatMessage({ id: "vault.splitConfig.step" })}
			</p>
			<div className="flex flex-col gap-[20px] p-[20px] bg-white/5 rounded-[10px] mt-[20px]">
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						{formatMessage({ id: "vault.splitConfig.n" })}
					</p>
					<UIInput
						type="number"
						value={n}
						onChange={e => handleNumberChange(e.target.value, setN)}
						placeholder={formatMessage({
							id: "vault.splitConfig.nPlaceholder",
						})}
						style={{
							maxWidth:
								locale === LocalizationTypes.Russian
									? "75%"
									: "50%",
						}}
					/>
				</div>
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						{formatMessage({ id: "vault.splitConfig.k" })}
					</p>
					<UIInput
						type="number"
						value={k}
						onChange={e => handleNumberChange(e.target.value, setK)}
						placeholder={formatMessage({
							id: "vault.splitConfig.kPlaceholder",
						})}
						style={{
							maxWidth:
								locale === LocalizationTypes.Russian
									? "75%"
									: "50%",
						}}
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
					style={{ width: "fit-content" }}
				/>
			</div>
		</div>
	);
};

export { VaultSplitConfigStep };
