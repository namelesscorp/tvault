import { useCallback, useMemo, useState } from "react";
import { Fragment } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RouteTypes } from "interfaces";
import { UIButton, UISectionHeading } from "features/UI";
import { icons } from "assets";
import { selectVaultWizardState } from "../../state/Vault.selectors";

const CONTAINER_VERSION = 1;

const humanCompression = { zip: "ZIP", none: "none" } as const;
const humanIntegrity = { none: "none", hmac: "HMAC-SHA256" } as const;

const VaultSummaryStep = () => {
	const { formatMessage } = useIntl();
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
			<UISectionHeading
				icon={icons.lock}
				text={formatMessage({ id: "title.create" })}
			/>
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				{formatMessage({ id: "vault.summary.step" })}
			</p>
			<div className="mt-[16px] grid grid-cols-[auto_1fr] gap-x-[30px] gap-y-[12px] p-[15px] bg-white/5 rounded-[10px] text-[15px] text-white">
				<p className="opacity-50">
					{formatMessage({ id: "container.version" })}:
				</p>
				<p>{CONTAINER_VERSION}</p>
				<p className="opacity-50">
					{formatMessage({ id: "container.comment" })}:
				</p>
				<p>{wizard.comment || "—"}</p>
				<p className="opacity-50">
					{formatMessage({ id: "container.tags" })}:
				</p>
				<p>{wizard.tags || "—"}</p>
				<p className="opacity-50">
					{formatMessage({ id: "container.compression" })}:
				</p>
				<p>{humanCompression[wizard.compression]}</p>
				<p className="opacity-50">
					{formatMessage({ id: "container.token" })}:
				</p>
				<p>{wizard.tokenType === "none" ? "—" : wizard.tokenType}</p>
				<p className="opacity-50">
					{formatMessage({ id: "container.integrity" })}:
				</p>
				<p>{humanIntegrity[wizard.integrityProvider]}</p>
				{wizard.tokenType === "share" && (
					<Fragment>
						<p className="opacity-50">
							{formatMessage({ id: "container.shares" })}:
						</p>
						<p>{wizard.n}</p>
						<p className="opacity-50">
							{formatMessage({ id: "container.threshold" })}:
						</p>
						<p>{wizard.k}</p>
					</Fragment>
				)}
				<p className="opacity-50">
					{formatMessage({ id: "container.name" })}:
				</p>
				<p>{wizard.name || "—"}</p>
				<p className="opacity-50">
					{formatMessage({ id: "container.containerPath" })}:
				</p>
				<p className="break-all">{wizard.outputPath || "—"}</p>
				<p className="opacity-50">
					{formatMessage({ id: "container.folderPath" })}:
				</p>
				<p className="break-all">{wizard.inputPath || "—"}</p>
				{showSharePath && (
					<Fragment>
						<p className="opacity-50">
							{formatMessage({
								id: `container.savePath.${wizard.tokenType}`,
							})}
							:
						</p>
						<p className="break-all">{wizard.sharePath || "—"}</p>
					</Fragment>
				)}
				<p className="opacity-50">
					{formatMessage({ id: "container.integrityPassword" })}:
				</p>
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
					text={formatMessage({ id: "common.back" })}
					onClick={() => navigate(-1)}
					style={{ width: "fit-content" }}
				/>
				<UIButton
					icon={icons.arrow_right}
					text={formatMessage({ id: "common.create" })}
					onClick={onFinish}
					style={{ width: "fit-content" }}
				/>
			</div>
		</div>
	);
};

export { VaultSummaryStep };
