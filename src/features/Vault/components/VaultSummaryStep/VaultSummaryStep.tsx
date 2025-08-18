import { useCallback, useMemo, useState } from "react";
import { Fragment } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RouteTypes } from "interfaces";
import { UIButton, UISectionHeading } from "features/UI";
import { icons } from "~/assets/collections/icons";
import { selectVaultWizardState } from "../../state/Vault.selectors";

const CONTAINER_VERSION = 1;

const humanCompression = { zip: "ZIP", none: "Нет" } as const;
const humanIntegrity = { none: "Нет", hmac: "HMAC-SHA256" } as const;

const VaultSummaryStep = () => {
	const wizard = useSelector(selectVaultWizardState);
	const navigate = useNavigate();
	const [showIntegrityPassword, setShowIntegrityPassword] = useState(false);

	const onFinish = useCallback(
		() => navigate(RouteTypes.VaultCreateEncryptRun),
		[navigate],
	);

	const showSharePath = useMemo(
		() => wizard.shareDest === "file",
		[wizard.shareDest],
	);

	const getPasswordDisplay = (password?: string) => {
		if (!password) return "—";
		return showIntegrityPassword ? password : "•".repeat(20);
	};

	return (
		<div>
			<UISectionHeading icon={icons.lock} text={"Create"} />
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				Step 6 / 6 — Final Сonfiguration
			</p>
			<div className="mt-[16px] grid grid-cols-[auto_1fr] gap-x-[30px] gap-y-[12px] p-[15px] bg-white/5 rounded-[10px] text-[15px] text-white">
				<p className="opacity-50">Version:</p>
				<p>{CONTAINER_VERSION}</p>
				<p className="opacity-50">Comment:</p>
				<p>{wizard.comment || "—"}</p>
				<p className="opacity-50">Tags:</p>
				<p>{wizard.tags || "—"}</p>
				<p className="opacity-50">Compression:</p>
				<p>{humanCompression[wizard.compression]}</p>
				<p className="opacity-50">Token:</p>
				<p>{wizard.tokenType === "none" ? "—" : wizard.tokenType}</p>
				<p className="opacity-50">Integrity:</p>
				<p>{humanIntegrity[wizard.integrityProvider]}</p>
				<p className="opacity-50">Shares:</p>
				<p>{wizard.split ? wizard.n : "—"}</p>
				<p className="opacity-50">Threshold:</p>
				<p>{wizard.split ? wizard.k : "—"}</p>
				<p className="opacity-50">Name:</p>
				<p>{wizard.name || "—"}</p>
				<p className="opacity-50">Container path:</p>
				<p className="break-all">{wizard.outputPath || "—"}</p>
				<p className="opacity-50">Folder path:</p>
				<p className="break-all">{wizard.inputPath || "—"}</p>
				{showSharePath && (
					<Fragment>
						<p className="opacity-50">Save path:</p>
						<p className="break-all">{wizard.sharePath || "—"}</p>
					</Fragment>
				)}
				<p className="opacity-50">Integrity password:</p>
				<div className="flex items-center gap-2">
					<p>{getPasswordDisplay(wizard.additionalPassword)}</p>
					{wizard.additionalPassword && (
						<button
							type="button"
							onClick={() =>
								setShowIntegrityPassword(!showIntegrityPassword)
							}
							className="w-[20px] h-[20px] flex items-center justify-center cursor-pointer mask-size-[16px] bg-white/50 hover:bg-white/70 transition-all duration-300 rounded-[4px]"
							style={{
								WebkitMask: `url("${showIntegrityPassword ? icons.eye_off : icons.eye}") no-repeat center`,
								mask: `url("${showIntegrityPassword ? icons.eye_off : icons.eye}") no-repeat center`,
							}}
						/>
					)}
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
					text="Create"
					onClick={onFinish}
					style={{ width: "fit-content" }}
				/>
			</div>
		</div>
	);
};

export { VaultSummaryStep };
