import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RouteTypes } from "interfaces";
import { UIButton, UISectionHeading } from "features/UI";
import { selectVaultOpenWizardState } from "features/Vault/state/Vault.selectors";
import { icons } from "~/assets/collections/icons";
import { useContainerInfo } from "../../hooks/useContainerInfo";

const humanIntegrity = { none: "None", hmac: "HMAC-SHA256" } as const;

const VaultDecryptSummaryStep = () => {
	const wizard = useSelector(selectVaultOpenWizardState);
	const navigate = useNavigate();
	const [showIntegrityPassword, setShowIntegrityPassword] = useState(false);
	const { run: runContainerInfo, done, result, error } = useContainerInfo();
	const [containerInfo, setContainerInfo] = useState<any>(null);

	useEffect(() => {
		if (wizard.containerPath && !containerInfo) {
			runContainerInfo(wizard.containerPath).catch(() => {});
		}
	}, [wizard.containerPath, containerInfo, runContainerInfo]);

	useEffect(() => {
		if (done && result && !error) {
			const containerData = result.data;
			if (containerData) {
				setContainerInfo(containerData);
			}
		}
	}, [done, result, error]);

	const onNext = useCallback(
		() => navigate(RouteTypes.VaultOpenRun),
		[navigate],
	);

	const getPasswordDisplay = (password?: string) => {
		if (!password) return "—";
		return showIntegrityPassword ? password : "•".repeat(20);
	};

	const getAuthMethodDisplay = () => {
		if (wizard.tokenType === "master") {
			return "Master token only";
		} else if (wizard.tokenType === "none") {
			return "Password only";
		} else if (wizard.tokenType === "share") {
			return "Shamir shares";
		}
		return "—";
	};

	return (
		<div>
			<UISectionHeading icon={icons.unlock} text={"Open"} />
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				Step 4 / 5 — Final Configuration
			</p>
			<div className="mt-[16px] grid grid-cols-[auto_1fr] gap-x-[30px] gap-y-[12px] p-[15px] bg-white/5 rounded-[10px] text-[15px] text-white">
				<p className="opacity-50">Version:</p>
				<p>{containerInfo?.version || "—"}</p>
				<p className="opacity-50">Token:</p>
				<p>{wizard.tokenType || "—"}</p>
				<p className="opacity-50">Auth method:</p>
				<p>{getAuthMethodDisplay()}</p>
				<p className="opacity-50">Integrity:</p>
				<p>{humanIntegrity[wizard.integrityProvider] || "—"}</p>
				<p className="opacity-50">Container path:</p>
				<p className="break-all">{wizard.containerPath || "—"}</p>
				<p className="opacity-50">Folder path:</p>
				<p className="break-all">{wizard.mountDir || "—"}</p>
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
					icon={icons.unlock}
					text="Open"
					onClick={onNext}
					style={{ width: "fit-content" }}
				/>
			</div>
		</div>
	);
};

export { VaultDecryptSummaryStep };
