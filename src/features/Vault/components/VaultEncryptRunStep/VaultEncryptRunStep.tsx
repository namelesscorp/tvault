import { openPath } from "@tauri-apps/plugin-opener";
import { Store } from "@tauri-apps/plugin-store";
import { useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useEffectOnce } from "react-use";
import { RouteTypes } from "interfaces";
import { devError, devLog } from "utils";
import { useAppDispatch } from "features/Store";
import { UIButton, UISectionHeading } from "features/UI";
import { icons } from "assets";
import { useEncrypt } from "../../hooks/useEncrypt";
import {
	vaultAddRecentWithMountPath,
	vaultResetWizardState,
	vaultSetWizardEncryptCompleted,
} from "../../state/Vault.actions";
import { selectVaultWizardState } from "../../state/Vault.selectors";

// guard against React StrictMode double-mount in dev
let ENCRYPT_RUN_GUARD = false;
let RECENT_ADDED_GUARD = false;

const VaultEncryptRunStep = () => {
	const { formatMessage } = useIntl();
	const wizard = useSelector(selectVaultWizardState);
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const [savedSharePath, setSavedSharePath] = useState<string>("");
	const [savedShareDest, setSavedShareDest] = useState<string>("");
	const [savedPassword, setSavedPassword] = useState<string>("");
	const [savedGeneratedKey, setSavedGeneratedKey] = useState<string>("");
	const [savedTokenType, setSavedTokenType] = useState<string>("");
	const [savedAdditionalPassword, setSavedAdditionalPassword] =
		useState<string>("");

	const { progress, done, result, error, run } = useEncrypt(wizard);

	const isCompleted = wizard.encryptCompleted;
	const finalDone = done || isCompleted;
	const finalResult =
		result ||
		(isCompleted
			? {
					masterToken: wizard.encryptResult?.masterToken,
					shares: wizard.encryptResult?.shares,
				}
			: null);

	useEffectOnce(() => {
		if (isCompleted) {
			setSavedPassword(wizard.encryptResult?.password || "");
			setSavedGeneratedKey(wizard.generatedKey || "");
			setSavedTokenType(wizard.tokenType || "");
			setSavedAdditionalPassword(
				wizard.encryptResult?.additionalPassword || "",
			);

			if (wizard.shareDest === "file" && wizard.sharePath) {
				setSavedSharePath(wizard.sharePath);
				setSavedShareDest(wizard.shareDest);
			} else if (wizard.shareDest === "stdout") {
				setSavedShareDest(wizard.shareDest);
			}
			return;
		}

		if (ENCRYPT_RUN_GUARD) return;
		ENCRYPT_RUN_GUARD = true;

		if (wizard.shareDest === "file" && wizard.sharePath) {
			setSavedSharePath(wizard.sharePath);
			setSavedShareDest(wizard.shareDest);
		} else if (wizard.shareDest === "stdout") {
			setSavedShareDest(wizard.shareDest);
		}

		setSavedPassword(wizard.passphrase || "");
		setSavedGeneratedKey(wizard.generatedKey || "");
		setSavedTokenType(wizard.tokenType || "");
		setSavedAdditionalPassword(wizard.additionalPassword || "");

		run();
		return () => {
			ENCRYPT_RUN_GUARD = false;
			RECENT_ADDED_GUARD = false;
		};
	});

	if (finalDone && !error) {
		ENCRYPT_RUN_GUARD = false;

		if (!isCompleted && finalResult) {
			dispatch(
				vaultSetWizardEncryptCompleted({
					masterToken: finalResult.masterToken,
					shares: finalResult.shares,
					password: savedPassword,
					additionalPassword: savedAdditionalPassword,
				}),
			);
		}

		if (!RECENT_ADDED_GUARD && wizard.outputPath) {
			RECENT_ADDED_GUARD = true;

			devLog(
				"[VaultEncryptRunStep] Container created successfully, wizard state:",
				wizard,
			);

			const containerPath = wizard.outputPath;

			(async () => {
				try {
					devLog(
						"[VaultEncryptRunStep] Adding container to recent:",
						containerPath,
					);

					const store = await Store.load("recent-containers.json");
					const KEY = "recent";
					const recent =
						(await store.get<
							{
								path: string;
								lastOpenedAt: number;
								lastMountPath?: string;
							}[]
						>(KEY)) ?? [];

					devLog(
						"[VaultEncryptRunStep] Current recent list:",
						recent,
					);

					const filtered = recent.filter(
						(r: { path: string }) => r.path !== containerPath,
					);
					filtered.unshift({
						path: containerPath,
						lastOpenedAt: Date.now(),
					});
					const capped = filtered.slice(0, 100);

					devLog(
						"[VaultEncryptRunStep] Updated recent list:",
						capped,
					);

					await store.set(KEY, capped);
					await store.save();

					dispatch(
						vaultAddRecentWithMountPath({ path: containerPath }),
					);
					devLog(
						"[VaultEncryptRunStep] Container successfully added to recent",
					);
				} catch (e) {
					devError(
						"[VaultEncryptRunStep] Error adding to recent:",
						e,
					);
					devError(e);
				}
			})();
		}
	}

	const copy = async (val: string) => {
		try {
			await navigator.clipboard.writeText(val);
			toast.success(formatMessage({ id: "common.copied" }));
		} catch (e) {
			devError(e);
		}
	};

	const openFileFolder = async () => {
		if (!savedSharePath) return;
		try {
			await openPath(savedSharePath);
		} catch (e) {
			devError(e);
			toast.error(formatMessage({ id: "common.openFolderError" }));
		}
	};

	if (error) {
		return (
			<div>
				<UISectionHeading
					icon={icons.lock}
					text={formatMessage({ id: "title.create" })}
				/>
				<p className="text-[20px] text-medium text-white text-center mt-[10px]">
					{formatMessage({ id: "vault.encryptRun.step.creating" })}
				</p>
				<div className="mt-[16px] grid grid-cols-[auto_1fr] gap-x-[30px] gap-y-[12px] p-[15px] bg-white/5 rounded-[10px] text-[15px] text-white">
					<p className="opacity-50">
						{formatMessage({ id: "common.error" })}:
					</p>
					<p>{String((error as Error)?.message ?? error)}</p>
				</div>
				<div className="flex items-center gap-[10px] mt-[20px]">
					<UIButton
						icon={icons.back}
						text={formatMessage({ id: "common.back" })}
						onClick={() => navigate(-1)}
						style={{ width: "fit-content" }}
					/>
					<UIButton
						icon={icons.close}
						text={formatMessage({ id: "common.close" })}
						onClick={() => {
							dispatch(vaultResetWizardState());
							navigate(RouteTypes.Dashboard);
						}}
						style={{ width: "fit-content" }}
					/>
				</div>
			</div>
		);
	}

	if (!done && !finalResult) {
		return (
			<div>
				<UISectionHeading
					icon={icons.lock}
					text={formatMessage({ id: "title.create" })}
				/>
				<p className="text-[20px] text-medium text-white text-center mt-[10px]">
					{formatMessage({ id: "vault.encryptRun.step.creating" })}
				</p>
				<div className="flex flex-col items-center gap-[20px] mt-[20px]">
					<div className="w-[320px]">
						<div className="h-[10px] bg-white/10 rounded-[10px]">
							<div
								className="h-[10px] bg-[#3361D8] rounded-[10px] transition-all duration-300 ease"
								style={{
									width: `${progress}%`,
								}}></div>
						</div>
					</div>
					<p className="text-[16px] text-white/50 text-medium">
						{formatMessage({ id: "common.progress" })} {progress}%
					</p>
				</div>
			</div>
		);
	}

	const res = finalResult as {
		masterToken?: string;
		shares?: string[];
	} | null;

	return (
		<div>
			<UISectionHeading
				icon={icons.lock}
				text={formatMessage({ id: "title.create" })}
			/>
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				{formatMessage({
					id: `vault.encryptRun.step.save.${savedTokenType}`,
				})}
			</p>
			{savedShareDest === "file" && (
				<div className="flex flex-col gap-[20px]">
					<div className="grid grid-cols-2 gap-[20px] mt-[20px]">
						<div className="grid grid-cols-[auto_1fr] p-[15px] gap-[10px] bg-white/5 rounded-[10px] text-white">
							<p className="opacity-50">
								{formatMessage({
									id: `container.savePath.${savedTokenType}`,
								})}
								:
							</p>
							<p className="text-[16px] text-medium text-white text-center overflow-hidden text-ellipsis whitespace-nowrap">
								{savedSharePath}
							</p>
						</div>
						<div className="flex items-center gap-[10px]">
							<UIButton
								icon={icons.folder}
								text="Open file"
								onClick={openFileFolder}
								style={{ width: "fit-content" }}
							/>
							{savedAdditionalPassword && (
								<UIButton
									icon={icons.copy}
									text="Copy integrity password"
									onClick={() =>
										copy(savedAdditionalPassword)
									}
									style={{ width: "fit-content" }}
								/>
							)}
							<UIButton
								icon={icons.check}
								text="Done"
								onClick={() => {
									dispatch(vaultResetWizardState());
									navigate(RouteTypes.Dashboard);
								}}
								style={{ width: "fit-content" }}
							/>
						</div>
					</div>
					{savedAdditionalPassword && (
						<div className="grid grid-cols-[1fr_auto] items-center gap-[10px] h-[50px] px-[15px] bg-[#3361D8]/10 border-[#2E68C4]/50 rounded-[10px] max-w-full">
							<p className="text-[16px] text-medium overflow-hidden text-ellipsis whitespace-nowrap text-white">
								{formatMessage({
									id: "container.integrityPassword",
								})}{" "}
								{savedAdditionalPassword}
							</p>
							<button
								type="button"
								onClick={() => copy(savedAdditionalPassword)}
								className="w-[20px] h-[20px] flex items-center justify-center cursor-pointer mask-size-[16px] bg-white/50 hover:bg-white/70 transition-all duration-300"
								style={{
									WebkitMask: `url("${icons.copy}") no-repeat center`,
									mask: `url("${icons.copy}") no-repeat center`,
								}}
							/>
						</div>
					)}
				</div>
			)}
			{savedShareDest === "stdout" && (
				<div className="flex flex-col gap-[20px]">
					<div className="flex flex-col gap-[20px] mt-[20px] text-white">
						{res?.masterToken && (
							<>
								<div className="grid grid-cols-[1fr_auto] items-center gap-[10px] h-[50px] px-[15px] bg-[#3361D8]/10 border-[#2E68C4]/50 rounded-[10px] max-w-full">
									<p className="text-[16px] text-medium overflow-hidden text-ellipsis whitespace-nowrap">
										{res?.masterToken}
									</p>
									<button
										type="button"
										onClick={() => copy(res?.masterToken!)}
										className="w-[20px] h-[20px] flex items-center justify-center cursor-pointer mask-size-[16px] bg-white/50 hover:bg-white/70 transition-all duration-300"
										style={{
											WebkitMask: `url("${icons.copy}") no-repeat center`,
											mask: `url("${icons.copy}") no-repeat center`,
										}}
									/>
								</div>
							</>
						)}
						{savedTokenType === "none" &&
							(savedPassword || savedGeneratedKey) && (
								<div className="grid grid-cols-[1fr_auto] items-center gap-[10px] h-[50px] px-[15px] bg-[#3361D8]/10 border-[#2E68C4]/50 rounded-[10px] max-w-full">
									<p className="text-[16px] text-medium overflow-hidden text-ellipsis whitespace-nowrap">
										{savedPassword || savedGeneratedKey}
									</p>
									<button
										type="button"
										onClick={() =>
											copy(
												savedPassword ||
													savedGeneratedKey!,
											)
										}
										className="w-[20px] h-[20px] flex items-center justify-center cursor-pointer mask-size-[16px] bg-white/50 hover:bg-white/70 transition-all duration-300"
										style={{
											WebkitMask: `url("${icons.copy}") no-repeat center`,
											mask: `url("${icons.copy}") no-repeat center`,
										}}
									/>
								</div>
							)}
						{res?.shares && (
							<div
								className={
									res.shares.length > 8
										? "grid grid-cols-2 gap-[15px]"
										: "flex flex-col gap-[10px]"
								}>
								{res.shares.map((tok, idx) => (
									<div
										key={idx}
										className="grid grid-cols-[1fr_auto] items-center gap-[10px] h-[50px] px-[15px] bg-[#3361D8]/10 border-[#2E68C4]/50 rounded-[10px] max-w-full">
										<p className="text-[16px] text-medium overflow-hidden text-ellipsis whitespace-nowrap">
											{tok}
										</p>
										<button
											type="button"
											onClick={() => copy(tok)}
											className="w-[20px] h-[20px] flex items-center justify-center cursor-pointer mask-size-[16px] bg-white/50 hover:bg-white/70 transition-all duration-300"
											style={{
												WebkitMask: `url("${icons.copy}") no-repeat center`,
												mask: `url("${icons.copy}") no-repeat center`,
											}}
										/>
									</div>
								))}
								{savedAdditionalPassword && (
									<div className="grid grid-cols-[1fr_auto] items-center gap-[10px] h-[50px] px-[15px] bg-[#3361D8]/10 border-[#2E68C4]/50 rounded-[10px] max-w-full">
										<p className="text-[16px] text-medium overflow-hidden text-ellipsis whitespace-nowrap">
											Integrity Password:{" "}
											{savedAdditionalPassword}
										</p>
										<button
											type="button"
											onClick={() =>
												copy(savedAdditionalPassword)
											}
											className="w-[20px] h-[20px] flex items-center justify-center cursor-pointer mask-size-[16px] bg-white/50 hover:bg-white/70 transition-all duration-300"
											style={{
												WebkitMask: `url("${icons.copy}") no-repeat center`,
												mask: `url("${icons.copy}") no-repeat center`,
											}}
										/>
									</div>
								)}
							</div>
						)}
					</div>
					<div className="flex items-center gap-[10px]">
						<UIButton
							icon={icons.copy}
							text={formatMessage({ id: "common.copyAll" })}
							onClick={() => {
								const allTokens = [];
								if (res?.masterToken) {
									allTokens.push(res.masterToken);
								}
								if (
									savedTokenType === "none" &&
									(savedPassword || savedGeneratedKey)
								) {
									allTokens.push(
										savedPassword || savedGeneratedKey,
									);
								}
								if (res?.shares) {
									allTokens.push(...res.shares);
								}
								if (savedAdditionalPassword) {
									allTokens.push(savedAdditionalPassword);
								}
								if (allTokens.length > 0) {
									copy(allTokens.join("\n"));
								}
							}}
							style={{ width: "fit-content" }}
						/>
						<UIButton
							icon={icons.check}
							text={formatMessage({ id: "common.done" })}
							onClick={() => {
								dispatch(vaultResetWizardState());
								navigate(RouteTypes.Dashboard);
							}}
							style={{ width: "fit-content" }}
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export { VaultEncryptRunStep };
